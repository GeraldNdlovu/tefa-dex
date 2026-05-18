import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";

// TEFA DEX specific addresses - UPDATE AFTER DEPLOYMENT
const POOL_ADDRESSES = process.env.POOL_ADDRESSES?.split(",").map(a => a.toLowerCase()) || [];

export const provideHandleTransaction = (
  poolAddresses: string[]
): HandleTransaction => {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // Get all addresses that received calls in this transaction
    const allAddresses = txEvent.addresses;
    
    // Count how many of our pools were called
    let poolCallCount = 0;
    for (const poolAddress of poolAddresses) {
      if (allAddresses[poolAddress]) {
        poolCallCount++;
      }
    }

    // Reentrancy pattern: multiple TEFA pools called in same transaction
    if (poolCallCount >= 2) {
      findings.push(
        Finding.fromObject({
          name: "TEFA: Multiple Pool Calls - Possible Reentrancy",
          description: `${poolCallCount} TEFA pools accessed in one transaction`,
          alertId: "TEFA-MULTI-POOL",
          severity: FindingSeverity.High,
          type: FindingType.Suspicious,
          metadata: {
            transactionHash: txEvent.hash,
            poolsCalled: poolCallCount.toString()
          },
        })
      );
    }

    return findings;
  };
};

export default {
  handleTransaction: provideHandleTransaction(POOL_ADDRESSES),
};
