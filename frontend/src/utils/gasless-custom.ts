import { ethers } from 'ethers';

const RELAYER_URL = 'https://dex.147.182.193.26.nip.io/api/gasless/submit';
const EXECUTOR_ADDRESS = '0xfA6e245B353934c6D9980b285F3660694764384c';
const TOKEN_A = '0xe64F6E38F004eDE64756dd62d4F10Ce28721e155';
const TOKEN_B = '0xa2a5CF99ae48dfAF190186f734142C6D17E887B9';

export async function customGaslessSwap(
  provider: ethers.BrowserProvider,
  amountIn: bigint,
  deadline: bigint
): Promise<{ jobId: string }> {
  const signer = await provider.getSigner();
  const user = await signer.getAddress();
  const chainId = (await provider.getNetwork()).chainId;

  const executor = new ethers.Contract(EXECUTOR_ADDRESS, [
    'function nonces(address) view returns (uint256)'
  ], provider);
  const nonce = await executor.nonces(user);

  const domain = {
    name: 'TefaGaslessExecutor',
    version: '1',
    chainId: Number(chainId),
    verifyingContract: EXECUTOR_ADDRESS
  };

  const types = {
    Swap: [
      { name: 'user', type: 'address' },
      { name: 'tokenIn', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'tokenOut', type: 'address' },
      { name: 'minOut', type: 'uint256' },
      { name: 'relayerFeeAmount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  const swap = {
    user: user,
    tokenIn: TOKEN_A,
    amountIn: amountIn,
    tokenOut: TOKEN_B,
    minOut: 0,
    relayerFeeAmount: 0,
    nonce: nonce,
    deadline: deadline
  };

  const signature = await signer.signTypedData(domain, types, swap);

  const swapForApi = {
    user: swap.user,
    tokenIn: swap.tokenIn,
    amountIn: swap.amountIn.toString(),
    tokenOut: swap.tokenOut,
    minOut: swap.minOut.toString(),
    relayerFeeAmount: swap.relayerFeeAmount.toString(),
    nonce: swap.nonce.toString(),
    deadline: swap.deadline.toString()
  };

  const response = await fetch(RELAYER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, swap: swapForApi, signature })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  const result = await response.json();
  return { jobId: result.jobId };
}
