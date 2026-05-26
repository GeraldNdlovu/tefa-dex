import { ethers } from 'ethers';

const PROJECT_ID = 'ee5f07aa-d6c3-41e3-9fdf-642d7aadc804';
const ROUTER_ADDRESS = '0x532C853Cf14Af8BB6B4E215CF482D106483F1Eb2';
const FORWARDER_ADDRESS = '0x9aecE1447491a85f936A20139c1Eb8C4Bd74b86d';
const TOKEN_A = '0x6644F8db48e76c54033D332304F6922aE962eD2C';
const TOKEN_B = '0xA682945F10e4e74F9532fB295Cc4c9C69dde60eB';

export async function biconomyGaslessSwap(
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

  // Use Biconomy's gasless API
  const response = await fetch('https://api.biconomy.io/api/v1/meta-tx/relay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': PROJECT_ID,
    },
    body: JSON.stringify({
      from: user,
      to: ROUTER_ADDRESS,
      data: data,
      signature: signature,
      chainId: chainId
    })
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Biconomy request failed');
  return result.txHash;
}
