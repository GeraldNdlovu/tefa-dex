// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Pool.sol";

contract Router {

    mapping(address => mapping(address => address)) public getPool;

    function createPool(address tokenA, address tokenB) external returns (address pool) {
        require(getPool[tokenA][tokenB] == address(0), "Pool exists");

        pool = address(new Pool(tokenA, tokenB));

        getPool[tokenA][tokenB] = pool;
        getPool[tokenB][tokenA] = pool;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");

        Pool(pool).addLiquidity(amountA, amountB);
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");

        amountOut = Pool(pool).swap(tokenIn, amountIn);
    }
}
