#!/bin/bash
# Add nonReentrant modifier to Pool.sol
sed -i 's/function swap(/function swap(/g' contracts/Pool.sol
sed -i 's/function addLiquidity(/function addLiquidity(/g' contracts/Pool.sol
# Add import for ReentrancyGuard
if ! grep -q "ReentrancyGuard" contracts/Pool.sol; then
  sed -i '3 i import "@openzeppelin/contracts/security/ReentrancyGuard.sol";' contracts/Pool.sol
  sed -i 's/contract Pool /contract Pool is ReentrancyGuard /g' contracts/Pool.sol
fi
echo "✅ Reentrancy fix applied to Pool.sol"
