// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Pool is ERC2771Context {
    address public token0;
    address public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant FEE = 3; // 0.3%

    event Swap(address indexed sender, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _token0, address _token1, address trustedForwarder)
        ERC2771Context(trustedForwarder)
    {
        token0 = _token0;
        token1 = _token1;
    }

    function _msgSender() internal view virtual override returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        IERC20(token0).transferFrom(_msgSender(), address(this), amount0);
        IERC20(token1).transferFrom(_msgSender(), address(this), amount1);
        reserve0 += amount0;
        reserve1 += amount1;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public pure returns (uint256)
    {
        require(amountIn > 0, "Invalid input");
        uint256 amountInWithFee = amountIn * (1000 - FEE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == token0 || tokenIn == token1, "Invalid token");

        IERC20(tokenIn).transferFrom(_msgSender(), address(this), amountIn);

        if (tokenIn == token0) {
            amountOut = getAmountOut(amountIn, reserve0, reserve1);
            reserve0 += amountIn;
            reserve1 -= amountOut;
            IERC20(token1).transfer(_msgSender(), amountOut);
        } else {
            amountOut = getAmountOut(amountIn, reserve1, reserve0);
            reserve1 += amountIn;
            reserve0 -= amountOut;
            IERC20(token0).transfer(_msgSender(), amountOut);
        }
    }
}
