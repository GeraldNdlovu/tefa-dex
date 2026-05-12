// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Router is ERC2771Context {
    mapping(address => mapping(address => address)) public getPool;
    address public feeCollector;

    event PoolCreated(address tokenA, address tokenB, address pool);
    event LiquidityAdded(address indexed user, address pool, uint256 amountA, uint256 amountB);
    event Swapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);

    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder)
    {}

    function _msgSender() internal view virtual override returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function setFeeCollector(address _feeCollector) external {
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(address(0), _feeCollector);
    }

    function createPool(address tokenA, address tokenB) external returns (address pool) {
        require(getPool[tokenA][tokenB] == address(0), "Pool exists");
        pool = address(new Pool(tokenA, tokenB, _msgSender(), feeCollector));
        getPool[tokenA][tokenB] = pool;
        getPool[tokenB][tokenA] = pool;
        emit PoolCreated(tokenA, tokenB, pool);
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external {
        address pool = getPool[tokenA][tokenB];
        require(pool != address(0), "Pool not found");
        
        IERC20(tokenA).transferFrom(_msgSender(), pool, amountA);
        IERC20(tokenB).transferFrom(_msgSender(), pool, amountB);
        
        Pool(pool).addLiquidity(amountA, amountB);
        
        emit LiquidityAdded(_msgSender(), pool, amountA, amountB);
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        
        IERC20(tokenIn).transferFrom(_msgSender(), pool, amountIn);
        amountOut = Pool(pool).swap(tokenIn, amountIn);
        
        emit Swapped(_msgSender(), tokenIn, tokenOut, amountIn, amountOut);
    }

    function swapDirect(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        
        uint256 userBalance = IERC20(tokenIn).balanceOf(msg.sender);
        require(userBalance >= amountIn, "User balance insufficient");
        
        IERC20(tokenIn).transferFrom(msg.sender, pool, amountIn);
        amountOut = Pool(pool).swap(tokenIn, amountIn);
        
        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function quote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut) {
        address pool = getPool[tokenIn][tokenOut];
        require(pool != address(0), "Pool not found");
        
        (uint256 reserveIn, uint256 reserveOut) = getReserves(pool, tokenIn, tokenOut);
        uint256 amountInWithFee = amountIn * 997 / 1000;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
    }

    function getReserves(address pool, address tokenIn, address) internal view returns (uint256 reserveIn, uint256 reserveOut) {
        (uint256 r0, uint256 r1) = Pool(pool).getReserves();
        address token0 = Pool(pool).token0();
        if (tokenIn == token0) {
            reserveIn = r0;
            reserveOut = r1;
        } else {
            reserveIn = r1;
            reserveOut = r0;
        }
    }
}
