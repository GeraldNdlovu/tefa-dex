// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustedForwarder {
    mapping(address => uint256) public nonces;
    
    bytes32 private immutable _DOMAIN_SEPARATOR;
    bytes32 private constant _EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant _FORWARD_REQUEST_TYPEHASH = keccak256("ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)");
    
    constructor() {
        _DOMAIN_SEPARATOR = keccak256(abi.encode(
            _EIP712_DOMAIN_TYPEHASH,
            keccak256("TrustedForwarder"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
    }
    
    function execute(
        address from,
        address to,
        uint256 value,
        uint256 gas,
        uint256 nonce,
        bytes calldata data,
        bytes calldata signature
    ) external returns (bool) {
        require(nonce == nonces[from], "Invalid nonce");
        
        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            _DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                _FORWARD_REQUEST_TYPEHASH,
                from,
                to,
                value,
                gas,
                nonce,
                keccak256(data)
            ))
        ));
        
        address signer = recoverSigner(digest, signature);
        require(signer == from, "Invalid signature");
        
        nonces[from]++;
        
        (bool success, ) = to.call{value: value, gas: gas}(data);
        require(success, "Execution failed");
        
        return true;
    }
    
    function recoverSigner(bytes32 hash, bytes calldata signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        if (v < 27) v += 27;
        return ecrecover(hash, v, r, s);
    }
}
