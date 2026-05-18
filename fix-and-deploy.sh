#!/bin/bash
set -e

echo "=== Writing corrected Pool.sol ==="
python3 << 'PYTHON'
import os
pool_content = '''// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Pool {
    address public token0;
    address public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant FEE = 3;

    mapping(address => uint256) public lpShares;
    uint256 public totalLpShares;
    address public router;

    event AddLiquidity(address indexed user, uint256 amount0, uint256 amount1, uint256 shares);
    event RemoveLiquidity(address indexed user, uint256 shares, uint256 amount0, uint256 amount1);
    event Swap(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
        router = msg.sender;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "Only router");
        _;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
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

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function addLiquidityFor(uint256 amount0, uint256 amount1, address user) external onlyRouter {
        require(amount0 > 0 && amount1 > 0, "Amounts > 0");
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);

        uint256 shares;
        if (totalLpShares == 0) {
            shares = sqrt(amount0 * amount1);
        } else {
            uint256 shares0 = (amount0 * totalLpShares) / reserve0;
            uint256 shares1 = (amount1 * totalLpShares) / reserve1;
            shares = min(shares0, shares1);
        }
        require(shares > 0, "Zero shares");

        lpShares[user] += shares;
        totalLpShares += shares;
        reserve0 += amount0;
        reserve1 += amount1;

        emit AddLiquidity(user, amount0, amount1, shares);
    }

    function removeLiquidityFor(uint256 shares, address user) external onlyRouter {
        require(shares > 0, "Shares > 0");
        require(lpShares[user] >= shares, "Insufficient shares");

        uint256 amount0 = (shares * reserve0) / totalLpShares;
        uint256 amount1 = (shares * reserve1) / totalLpShares;
        require(amount0 > 0 && amount1 > 0, "Zero amounts");

        lpShares[user] -= shares;
        totalLpShares -= shares;
        reserve0 -= amount0;
        reserve1 -= amount1;

        IERC20(token0).transfer(user, amount0);
        IERC20(token1).transfer(user, amount1);

        emit RemoveLiquidity(user, shares, amount0, amount1);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        uint256 amountInWithFee = amountIn * (1000 - FEE) / 1000;
        return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
    }

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == token0 || tokenIn == token1, "Invalid token");
        (uint256 reserveIn, uint256 reserveOut) = tokenIn == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        require(amountOut > 0, "Insufficient output");

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        if (tokenIn == token0) {
            IERC20(token1).transfer(msg.sender, amountOut);
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            IERC20(token0).transfer(msg.sender, amountOut);
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
        emit Swap(msg.sender, tokenIn, amountIn, amountOut);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }

    function getLpInfo(address user) external view returns (uint256 shares, uint256 total, uint256 sharePercent) {
        shares = lpShares[user];
        total = totalLpShares;
        if (total > 0) sharePercent = (shares * 100) / total;
    }
}
'''
with open('contracts/Pool.sol', 'w') as f:
    f.write(pool_content)
print("✅ Pool.sol written")
PYTHON

python3 << 'PYTHON2'
router_content = '''// SPDX-License-Identifier: MIT
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

    function removeLiquidity(address tokenA, address tokenB, uint256 shares) external {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");
        Pool(pool).removeLiquidityFor(shares, _msgSender());
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        IERC20(tokenIn).transferFrom(_msgSender(), address(this), amountIn);
        IERC20(tokenIn).approve(pool, amountIn);
        amountOut = Pool(pool).swap(tokenIn, amountIn);
        IERC20(tokenOut).transfer(_msgSender(), amountOut);
        return amountOut;
    }
}
'''
with open('contracts/Router.sol', 'w') as f:
    f.write(router_content)
print("✅ Router.sol written")
PYTHON2

echo "=== Compiling ==="
npx hardhat clean
npx hardhat compile

echo "=== Deploying to Sepolia ==="
node deploy-sepolia-fixed.cjs
