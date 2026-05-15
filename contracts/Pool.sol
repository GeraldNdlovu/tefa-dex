// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFeeCollector {
    function distributeFees(address pool, address token, uint256 amount) external;
}

contract Pool {
    address public token0;
    address public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant FEE = 3; // 0.3%
    address public feeCollector;
    
    // LP shares with 18 decimals precision (1 LP share = 1e18)
    mapping(address => uint256) public lpShares;
    uint256 public totalLpShares;
    
    // Scaling factor for share calculation
    uint256 public constant PRECISION = 1e18;
    
    event Swap(address indexed sender, address tokenIn, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 shares);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 shares);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    
    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
    }
    
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");
        
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        
        uint256 shares;
        if (totalLpShares == 0) {
            // Initial mint: shares = sqrt(amount0 * amount1)
            shares = sqrt(amount0 * amount1);
            require(shares > 0, "Initial shares must be > 0");
        } else {
            // Calculate shares based on proportion of existing reserves
            shares = (amount0 * totalLpShares) / reserve0;
            uint256 shares1 = (amount1 * totalLpShares) / reserve1;
            if (shares1 < shares) shares = shares1;
            require(shares > 0, "Shares must be > 0");
        }
        
        reserve0 += amount0;
        reserve1 += amount1;
        lpShares[msg.sender] += shares;
        totalLpShares += shares;
        
        emit LiquidityAdded(msg.sender, amount0, amount1, shares);
    }
    
    function removeLiquidity(uint256 shares) external {
        require(shares > 0, "Shares must be > 0");
        require(lpShares[msg.sender] >= shares, "Insufficient shares");
        
        uint256 amount0 = (shares * reserve0) / totalLpShares;
        uint256 amount1 = (shares * reserve1) / totalLpShares;
        
        require(amount0 > 0 && amount1 > 0, "Amounts must be > 0");
        
        lpShares[msg.sender] -= shares;
        totalLpShares -= shares;
        reserve0 -= amount0;
        reserve1 -= amount1;
        
        IERC20(token0).transfer(msg.sender, amount0);
        IERC20(token1).transfer(msg.sender, amount1);
        
        emit LiquidityRemoved(msg.sender, amount0, amount1, shares);
    }
    
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public pure returns (uint256) 
    {
        require(amountIn > 0, "Invalid input");
        uint256 amountInWithFee = amountIn * (1000 - FEE) / 1000;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithFee;
        return numerator / denominator;
    }
    
    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == token0 || tokenIn == token1, "Invalid token");
        
        uint256 fee = amountIn * FEE / 1000;
        uint256 amountInAfterFee = amountIn - fee;
        
        if (tokenIn == token0) {
            amountOut = getAmountOut(amountInAfterFee, reserve0, reserve1);
            reserve0 += amountIn;
            reserve1 -= amountOut;
            IERC20(token1).transfer(msg.sender, amountOut);
        } else {
            amountOut = getAmountOut(amountInAfterFee, reserve1, reserve0);
            reserve1 += amountIn;
            reserve0 -= amountOut;
            IERC20(token0).transfer(msg.sender, amountOut);
        }
        
        if (fee > 0 && feeCollector != address(0)) {
            IERC20(tokenIn).approve(feeCollector, fee);
            IFeeCollector(feeCollector).distributeFees(address(this), tokenIn, fee);
        }
        
        emit Swap(msg.sender, tokenIn, amountIn, amountOut);
    }
    
    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }
    
    function getLpInfo(address provider) external view returns (uint256 shares, uint256 amount0, uint256 amount1) {
        shares = lpShares[provider];
        if (shares > 0 && totalLpShares > 0) {
            amount0 = (shares * reserve0) / totalLpShares;
            amount1 = (shares * reserve1) / totalLpShares;
        }
    }
    
    function setFeeCollector(address _feeCollector) external {
        require(msg.sender == address(this) || msg.sender == address(0), "Unauthorized");
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }
    
    function sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
