import { ethers } from 'ethers';

const RELAYER_URL = 'https://dex.147.182.193.26.nip.io/api/gasless/submit';
const FORWARDER_ADDRESS = '0x9aecE1447491a85f936A20139c1Eb8C4Bd74b86d';

const getDomain = (chainId: number) => ({
  name: 'TrustedForwarder',
  version: '1',
  chainId: chainId,
  verifyingContract: FORWARDER_ADDRESS,
});

const types = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
};

export async function executeGaslessSwap(
  provider: ethers.BrowserProvider,
  signer: ethers.Signer,
  routerAddress: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  amountOutMin: bigint,
  deadline: bigint
): Promise<{ txHash: string }> {
  const fromAddress = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  const routerInterface = new ethers.Interface([
    'function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, uint256 deadline) returns (uint256)'
  ]);
  const data = routerInterface.encodeFunctionData('swap', [tokenIn, tokenOut, amountIn, amountOutMin, deadline]);

  // Send nonce: 0 - let relayer fetch the correct nonce
  const request = {
    from: fromAddress,
    to: routerAddress,
    value: 0,
    gas: 300000,
    nonce: 0,
    data: data
  };

  const domain = getDomain(chainId);
  const signature = await (signer as any).signTypedData(domain, types, request);

  const response = await fetch(RELAYER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: request.from,
      to: request.to,
      value: request.value.toString(),
      gas: request.gas.toString(),
      nonce: request.nonce.toString(),
      data: request.data,
      signature: signature
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return { txHash: result.txHash };
}
