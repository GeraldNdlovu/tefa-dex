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

    // ADDED: Slippage protection parameters
    function addLiquidity(
        address tokenA, 
        address tokenB, 
        uint256 amountA,
        uint256 amountB,
        uint256 amountAMin,  // NEW: Minimum acceptable amount of token A
        uint256 amountBMin,  // NEW: Minimum acceptable amount of token B
        uint256 deadline      // NEW: Transaction deadline
    ) external {
        require(block.timestamp <= deadline, "Expired");
        require(amountA >= amountAMin, "Slippage A");
        require(amountB >= amountBMin, "Slippage B");
        
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");
        
        // Record balances to check actual received (for fee-on-transfer tokens)
        uint256 balanceABefore = IERC20(tokenA).balanceOf(address(this));
        uint256 balanceBBefore = IERC20(tokenB).balanceOf(address(this));
        
        IERC20(tokenA).transferFrom(_msgSender(), address(this), amountA);
        IERC20(tokenB).transferFrom(_msgSender(), address(this), amountB);
        
        // Check actual received amounts
        uint256 actualA = IERC20(tokenA).balanceOf(address(this)) - balanceABefore;
        uint256 actualB = IERC20(tokenB).balanceOf(address(this)) - balanceBBefore;
        require(actualA >= amountAMin, "Actual A below min");
        require(actualB >= amountBMin, "Actual B below min");
        
        IERC20(tokenA).approve(pool, actualA);
        IERC20(tokenB).approve(pool, actualB);
        
        Pool(pool).addLiquidityFor(actualA, actualB, _msgSender());
    }

    // ADDED: Slippage protection for remove
    function removeLiquidity(
        address tokenA, 
        address tokenB, 
        uint256 shares,
        uint256 amountAMin,  // NEW: Minimum token A to receive
        uint256 amountBMin,  // NEW: Minimum token B to receive
        uint256 deadline      // NEW: Transaction deadline
    ) external {
        require(block.timestamp <= deadline, "Expired");
        
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");
        
        // Get expected amounts before removing
        (uint256 expectedA, uint256 expectedB) = Pool(pool).quoteLiquidity(shares);
        require(expectedA >= amountAMin, "Slippage A");
        require(expectedB >= amountBMin, "Slippage B");
        
        Pool(pool).removeLiquidityFor(shares, _msgSender());
    }

    // ADDED: Slippage protection for swap
    function swap(
        address tokenIn, 
        address tokenOut, 
        uint256 amountIn,
        uint256 amountOutMin,  // NEW: Minimum output amount
        address to,            // NEW: Recipient address
        uint256 deadline       // NEW: Transaction deadline
    ) external returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "Expired");
        
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        
        IERC20(tokenIn).transferFrom(_msgSender(), address(this), amountIn);
        IERC20(tokenIn).approve(pool, amountIn);
        
        amountOut = Pool(pool).swap(tokenIn, amountIn);
        require(amountOut >= amountOutMin, "Insufficient output");
        
        IERC20(tokenOut).transfer(to, amountOut);
        return amountOut;
    }

    // Emergency rescue for stuck tokens
    function rescueTokens(address token, address to) external {
        // TODO: Replace with your own access control (multisig recommended)
        require(msg.sender == tx.origin, "Unauthorized");
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).transfer(to, balance);
        }
    }
    
    // Helper to get expected output without executing
    function quoteSwap(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        return Pool(pool).quoteSwap(amountIn);
    }
}
