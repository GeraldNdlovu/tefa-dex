# Gasless DEX Architecture (EIP-2771)

## Components
1. **ERC2771Forwarder** (OpenZeppelin) - Trusted forwarder
2. **Router** - Accepts meta-transactions via forwarder
3. **Relayer Service** - Submits signed user requests
4. **Frontend** - Signs EIP-712 typed data

## Flow
1. User connects wallet
2. User signs swap request (EIP-712) - no gas
3. Frontend sends signature to relayer
4. Relayer submits to forwarder (pays gas)
5. Forwarder calls router with original sender
6. Router executes swap using `_msgSender()`

## Deployment (Separate from v1)
- New forwarder address
- New router address
- New pool (or migrate liquidity)
- Relayer private key with Sepolia ETH

## Status
- [ ] Deploy OpenZeppelin ERC2771Forwarder
- [ ] Deploy new router with forwarder
- [ ] Create relayer service
- [ ] Implement EIP-712 signing in frontend
- [ ] Test end-to-end
