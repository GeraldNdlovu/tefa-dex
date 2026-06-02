// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SimplePool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleRouter {
    mapping(address => mapping(address => address)) public getPool;

    function createPool(address tokenA, address tokenB) external returns (address pool) {
        require(getPool[tokenA][tokenB] == address(0), "Pool exists");
        pool = address(new SimplePool(tokenA, tokenB));
        getPool[tokenA][tokenB] = pool;
        getPool[tokenB][tokenA] = pool;
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");
        IERC20(tokenA).transferFrom(msg.sender, pool, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pool, amountB);
        SimplePool(pool).addLiquidity(amountA, amountB);
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        IERC20(tokenIn).transferFrom(msg.sender, pool, amountIn);
        amountOut = SimplePool(pool).swap(tokenIn, amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);
    }
}
