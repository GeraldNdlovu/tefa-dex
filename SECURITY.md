# Security Policy

## Supported Versions

| Version | Supported | Network |
| ------- | --------- | ------- |
| 2.x.x   | ✅ | Sepolia Testnet |
| 1.x.x   | ❌ | Local Development Only |

## Reporting a Vulnerability

### Critical Vulnerabilities (Loss of Funds, Access Control Bypass)

**Response Time:** 24 hours
**Resolution Target:** 7 days

**How to Report:**
- **Email:** security@tefa.exchange
- **PGP Key:** [Available upon request]
- **Direct Message:** @TEFA_Security on Telegram

### Medium Severity (Gas Issues, Frontrunning, MEV)

**Response Time:** 48 hours
**Resolution Target:** 14 days

### Low Severity (UI Bugs, Event Emission Issues)

**Response Time:** 5 business days
**Resolution Target:** 30 days

## Vulnerability Disclosure Program

We encourage responsible disclosure of security vulnerabilities.

### When Reporting, Please Include:

1. **Description** - Clear explanation of the issue
2. **Impact** - What could an attacker do?
3. **Proof of Concept** - Code or transaction data demonstrating the issue
4. **Suggested Fix** - If you have one
5. **Test Environment** - Sepolia testnet preferred

### What to Expect:

1. **Acknowledgment** - Within 24 hours
2. **Investigation** - We'll verify and assess impact
3. **Fix Development** - We'll create a patch
4. **Audit** - Critical fixes get third-party review
5. **Deployment** - Fix deployed to testnet, then mainnet
6. **Disclosure** - Public acknowledgment after fix is live

## Scope

### In Scope

| Contract | File | Risk Level |
|----------|------|------------|
| Router.sol | routes swaps | HIGH |
| Pool.sol | AMM logic, fee calculation | HIGH |
| FeeCollector.sol | Revenue distribution | HIGH |
| MockERC20.sol | Test tokens | LOW |

### Out of Scope

- Frontend UI/UX issues (report via GitHub Issues)
- Centralization risks (we're working on governance)
- Theoretical attacks requiring unrealistic conditions

## Responsible Disclosure

We believe in responsible disclosure. If you find a vulnerability:

1. **DO NOT** exploit it on mainnet
2. **DO NOT** share it publicly until we've fixed it
3. **DO** report it to us privately
4. **DO** give us reasonable time to fix it

## Bug Bounty (Coming Soon)

Once mainnet is deployed, we will launch a bug bounty program with rewards up to **$50,000 USD** for critical vulnerabilities.

### Proposed Tiers:

| Severity | Reward Range |
|----------|--------------|
| Critical | $10,000 - $50,000 |
| High | $5,000 - $10,000 |
| Medium | $1,000 - $5,000 |
| Low | $100 - $1,000 |

## Audits

| Date | Auditor | Scope | Report |
|------|---------|-------|--------|
| Q3 2025 | CertiK (Pending) | Full protocol | [Link] |
| Q4 2025 | Trail of Bits (Pending) | Fee Collector | [Link] |

## Emergency Contacts

For urgent security matters outside business hours:

- **Emergency Email:** emergency@tefa.exchange
- **Signal:** +1 (XXX) XXX-XXXX (available upon request)

## Known Vulnerabilities

None currently. See [GitHub Issues](https://github.com/GeraldNdlovu/tefa-dex/issues) for non-security bugs.

## License

This security policy is licensed under MIT.

---

**Last Updated:** May 2026
**Version:** 1.0.0
