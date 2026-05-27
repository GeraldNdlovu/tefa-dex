// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimplePool {
    address public token0;
    address public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant FEE = 3;

    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
    }

   function addLiquidity(uint256 amount0, uint256 amount1) external {
    reserve0 += amount0;
    reserve1 += amount1;
    }

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == token0 || tokenIn == token1, "Invalid token");

        uint256 amountInWithFee = amountIn * (1000 - FEE) / 1000;

        if (tokenIn == token0) {
            amountOut = (amountInWithFee * reserve1) / (reserve0 + amountInWithFee);
            reserve0 += amountIn;
            reserve1 -= amountOut;
            IERC20(token1).transfer(msg.sender, amountOut);
        } else {
            amountOut = (amountInWithFee * reserve0) / (reserve1 + amountInWithFee);
            reserve1 += amountIn;
            reserve0 -= amountOut;
            IERC20(token0).transfer(msg.sender, amountOut);
        }
    }
}
