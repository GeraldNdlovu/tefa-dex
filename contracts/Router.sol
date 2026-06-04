// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Router is ERC2771Context {
    mapping(address => mapping(address => address)) public getPool;

    event PoolCreated(address tokenA, address tokenB, address pool);

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function _msgSender() internal view virtual override returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function createPool(address tokenA, address tokenB) external returns (address pool) {
        require(getPool[tokenA][tokenB] == address(0), "Pool exists");
        pool = address(new Pool(tokenA, tokenB));
        getPool[tokenA][tokenB] = pool;
        getPool[tokenB][tokenA] = pool;
        emit PoolCreated(tokenA, tokenB, pool);
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");

        IERC20(tokenA).transferFrom(_msgSender(), address(this), amountA);
        IERC20(tokenB).transferFrom(_msgSender(), address(this), amountB);

        IERC20(tokenA).approve(pool, amountA);
        IERC20(tokenB).approve(pool, amountB);

        Pool(pool).addLiquidityFor(amountA, amountB, _msgSender());
    }

    // ADDED: View function to get expected output amount
    function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) external view returns (uint256) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        
        (uint256 reserve0, uint256 reserve1) = Pool(pool).getReserves();
        address token0 = Pool(pool).token0();
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == token0) {
            reserveIn = reserve0;
            reserveOut = reserve1;
        } else {
            reserveIn = reserve1;
            reserveOut = reserve0;
        }
        
        return Pool(pool).getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) external returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        
        require(block.timestamp <= deadline, "Router: expired");
        
        IERC20(tokenIn).transferFrom(_msgSender(), address(this), amountIn);
        IERC20(tokenIn).approve(pool, amountIn);
        amountOut = Pool(pool).swap(tokenIn, amountIn);
        
        require(amountOut >= amountOutMin, "Router: slippage too high");
        
        IERC20(tokenOut).transfer(_msgSender(), amountOut);
        return amountOut;
    }
}
