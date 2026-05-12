// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

interface IFeeCollector {
    function distributeFees(address pool, address token, uint256 amount) external;
}

contract Pool is ERC2771Context {
    address public token0;
    address public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant FEE = 3;
    address public feeCollector;

    event Swap(address indexed sender, address tokenIn, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1);

    constructor(address _token0, address _token1, address trustedForwarder, address _feeCollector)
        ERC2771Context(trustedForwarder)
    {
        token0 = _token0;
        token1 = _token1;
        feeCollector = _feeCollector;
    }

    function _msgSender() internal view virtual override returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        reserve0 += amount0;
        reserve1 += amount1;
        emit LiquidityAdded(_msgSender(), amount0, amount1);
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
            IERC20(token1).transfer(_msgSender(), amountOut);
        } else {
            amountOut = getAmountOut(amountInAfterFee, reserve1, reserve0);
            reserve1 += amountIn;
            reserve0 -= amountOut;
            IERC20(token0).transfer(_msgSender(), amountOut);
        }

        if (fee > 0 && feeCollector != address(0)) {
            IERC20(tokenIn).approve(feeCollector, fee);
            IFeeCollector(feeCollector).distributeFees(address(this), tokenIn, fee);
        }

        emit Swap(_msgSender(), tokenIn, amountIn, amountOut);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }

    function updateFeeCollector(address _newFeeCollector) external {
        require(_msgSender() == address(this) || _msgSender() == address(0), "Unauthorized");
        feeCollector = _newFeeCollector;
    }
}
