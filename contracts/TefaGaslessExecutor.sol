// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract TefaGaslessExecutor is EIP712, Ownable {
    address public trustedRelayer;
    address public immutable router;
    mapping(address => uint256) public nonces;

    event SwapExecuted(address indexed user, address tokenOut, uint256 amountOut, uint256 relayerFee);

    constructor(address _router, address _relayer) 
        EIP712("TefaGaslessExecutor", "1") 
        Ownable(msg.sender) 
    {
        router = _router;
        trustedRelayer = _relayer;
    }

    bytes32 private constant SWAP_TYPEHASH = keccak256(
        "Swap(address user,address tokenIn,uint256 amountIn,address tokenOut,uint256 minOut,uint256 relayerFeeAmount,uint256 nonce,uint256 deadline)"
    );

    struct Swap {
        address user;
        address tokenIn;
        uint256 amountIn;
        address tokenOut;
        uint256 minOut;
        uint256 relayerFeeAmount;
        uint256 nonce;
        uint256 deadline;
    }

    function executeSwap(
        Swap calldata swap,
        bytes calldata signature
    ) external {
        require(msg.sender == trustedRelayer, "!relayer");
        require(block.timestamp <= swap.deadline, "expired");
        require(swap.nonce == nonces[swap.user], "bad nonce");

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    SWAP_TYPEHASH,
                    swap.user,
                    swap.tokenIn,
                    swap.amountIn,
                    swap.tokenOut,
                    swap.minOut,
                    swap.relayerFeeAmount,
                    swap.nonce,
                    swap.deadline
                )
            )
        );

        require(ECDSA.recover(digest, signature) == swap.user, "bad sig");
        nonces[swap.user]++;

        // Transfer tokens from user to this contract
        IERC20(swap.tokenIn).transferFrom(swap.user, address(this), swap.amountIn);
        
        // Approve router to spend tokens
        IERC20(swap.tokenIn).approve(router, swap.amountIn);
        
        // Call router's swap function directly
        (bool success, bytes memory result) = router.call(
            abi.encodeWithSignature(
                "swap(address,address,uint256)",
                swap.tokenIn,
                swap.tokenOut,
                swap.amountIn
            )
        );
        require(success, "swap failed");
        
        uint256 outputAmount = abi.decode(result, (uint256));
        require(outputAmount > swap.relayerFeeAmount, "fee > output");

        // Send output to user, fee to relayer
        IERC20(swap.tokenOut).transfer(trustedRelayer, swap.relayerFeeAmount);
        IERC20(swap.tokenOut).transfer(swap.user, outputAmount - swap.relayerFeeAmount);

        emit SwapExecuted(swap.user, swap.tokenOut, outputAmount, swap.relayerFeeAmount);
    }

    function updateRelayer(address _newRelayer) external onlyOwner {
        trustedRelayer = _newRelayer;
    }
}
