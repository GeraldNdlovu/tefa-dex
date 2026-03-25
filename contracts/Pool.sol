// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Pool {
    address public token0;
    address public token1;
    address public router;

    uint256 public reserve0;
    uint256 public reserve1;

    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
    }

    function setRouter(address _router) external {
        require(router == address(0), "Router already set");
        router = _router;
        // Pre-approve Router for unlimited output transfers
        IERC20(token0).approve(router, type(uint256).max);
        IERC20(token1).approve(router, type(uint256).max);
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        require(msg.sender == router, "Only router can call");
        reserve0 += amount0;
        reserve1 += amount1;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public
        pure
        returns (uint256)
    {
        require(amountIn > 0, "Invalid input");
        require(reserveIn > 0 && reserveOut > 0, "No liquidity");

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(msg.sender == router, "Only router can call");
        require(tokenIn == token0 || tokenIn == token1, "Invalid token");

        if (tokenIn == token0) {
            amountOut = getAmountOut(amountIn, reserve0, reserve1);
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            amountOut = getAmountOut(amountIn, reserve1, reserve0);
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
    }
}
