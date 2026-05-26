import { ethers } from 'ethers';

// NEW SEPOLIA-SPECIFIC API KEY
const GELATO_API_KEY = 'test_xqeMzgrh9fTUh6nUY13y177PD9WlHuZnIt_3UlJnwBo_';
const GELATO_RPC_URL = `https://api.gelato.cloud/rpc/11155111?apiKey=${GELATO_API_KEY}`;

const ROUTER_ADDRESS = '0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2';
const FORWARDER_ADDRESS = '0x9aecE1447491a85f936A20139c1Eb8C4Bd74b86d';
const TOKEN_A = '0x6644F8db48e76c54033D332304F6922aE962eD2C';
const TOKEN_B = '0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB';

export async function gaslessSwap(
  provider: ethers.BrowserProvider,
  amountIn: bigint,
  deadline: bigint
): Promise<string> {
  const signer = await provider.getSigner();
  const user = await signer.getAddress();

  const iface = new ethers.Interface([
    'function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) returns (uint256)'
  ]);
  const data = iface.encodeFunctionData('swap', [TOKEN_A, TOKEN_B, amountIn, 0n, deadline]);

  const chainId = Number((await provider.getNetwork()).chainId);
  const nonce = await provider.getTransactionCount(user);

  const domain = {
    name: 'TrustedForwarder',
    version: '1',
    chainId: chainId,
    verifyingContract: FORWARDER_ADDRESS
  };

  const types = {
    ForwardRequest: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'gas', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ]
  };

  const message = {
    from: user,
    to: ROUTER_ADDRESS,
    value: 0,
    gas: 300000,
    nonce: nonce,
    data: data
  };

  const signature = await signer.signTypedData(domain, types, message);

  const response = await fetch(GELATO_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chainId: chainId,
      target: ROUTER_ADDRESS,
      data: data,
      user: user,
      signature: signature
    })
  });

  const result = await response.json();
  if (!response.ok) {
    console.error('Gelato error details:', result);
    throw new Error(result.message || 'Gelato request failed');
  }
  return result.taskId;
}
