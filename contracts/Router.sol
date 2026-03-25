// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Router is ERC2771Context {
    mapping(address => mapping(address => address)) public getPool;

    event PoolCreated(address tokenA, address tokenB, address pool);

    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder)
    {}

    function _msgSender() internal view virtual override returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function createPool(address tokenA, address tokenB) external returns (address pool) {
        require(getPool[tokenA][tokenB] == address(0), "Pool exists");
        pool = address(new Pool(tokenA, tokenB, _msgSender()));
        getPool[tokenA][tokenB] = pool;
        getPool[tokenB][tokenA] = pool;
        emit PoolCreated(tokenA, tokenB, pool);
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");
        
        // Transfer tokens from user to router
        IERC20(tokenA).transferFrom(_msgSender(), address(this), amountA);
        IERC20(tokenB).transferFrom(_msgSender(), address(this), amountB);
        
        // Approve pool to spend router's tokens
        IERC20(tokenA).approve(pool, amountA);
        IERC20(tokenB).approve(pool, amountB);
        
        // Pool transfers tokens from router to itself
        Pool(pool).addLiquidity(amountA, amountB);
        
        // Update reserves (handled inside pool)
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        
        // Transfer tokenIn from user to router
        IERC20(tokenIn).transferFrom(_msgSender(), address(this), amountIn);
        
        // Approve pool to spend router's tokens
        IERC20(tokenIn).approve(pool, amountIn);
        
        // Execute swap (pool transfers tokenIn from router, sends tokenOut to router)
        amountOut = Pool(pool).swap(tokenIn, amountIn);
        
        // Transfer tokenOut from router to user
        IERC20(tokenOut).transfer(_msgSender(), amountOut);
    }
}
