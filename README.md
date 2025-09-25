# OKX DEX Market SDK

| SDK version | OKX Web3 API |
| ----------- | ------------ |
| `0.1.x`     | v5           |
| `1.0.x`     | v6           |

A lean TypeScript SDK that wraps the OKX Web3 DEX Market, Balance, Index Price, and Transaction History APIs with a single, class-based entry point. Built for Node.js runtimes that need predictable request signing, minimal dependencies, and clear ergonomics.

## Why this SDK

- One class (`OKXDexSDK`) covers signed requests for every supported endpoint.
- Deterministic query serialization keeps OKX signature verification happy.
- Bundled ESM + CJS builds ship with full TypeScript types and zero runtime deps beyond `undici` and `crypto-js`.
- No hidden retries or global state: you stay in control of flow, caching, and backoff strategies.

## Install

```bash
npm install okx-dex-market-sdk
# or: pnpm add | yarn add | bun add okx-dex-market-sdk
```

## Quick start

```ts
import { OKXDexSDK } from "okx-dex-market-sdk";

const sdk = new OKXDexSDK();

const prices = await sdk.marketTokenPriceInfo([
  { chainIndex: "1", tokenContractAddress: "0xTokenA" },
  { chainIndex: "137", tokenContractAddress: "0xTokenB" },
]);
```

### Credentials

By default the SDK reads your keys from the environment:

- `OKX_API_KEY`
- `OKX_SECRET_KEY`
- `OKX_API_PASSPHRASE`
- `OKX_PROJECT_ID`

Pass them explicitly if you prefer:

```ts
const sdk = new OKXDexSDK({
  credentials: {
    apiKey: process.env.OKX_API_KEY!,
    secretKey: process.env.OKX_SECRET_KEY!,
    passphrase: process.env.OKX_API_PASSPHRASE!,
    projectId: process.env.OKX_PROJECT_ID!,
  },
});
```

## API surface

All methods return parsed JSON `data` from OKX and throw on HTTP 4xx/5xx or `code !== "0"` responses.

- **Market Price**: `marketPriceChains`, `marketPrice`, `marketTrades`, `marketCandlesticks`, `marketCandlesticksHistory`
- **Market Tokens**: `marketTokenSearch`, `marketTokenBasicInfo`, `marketTokenPriceInfo`, `marketTokenRanking`, `marketTokenHolder`
- **Index Price**: `indexPriceChains`, `indexPrice`, `historicalIndexPrice`
- **Balance**: `balanceChains`, `balanceTotalValue`, `balanceTotalTokenBalances`, `balanceSpecificTokenBalance`
- **Transaction History**: `txHistoryChains`, `txHistoryTransactionsByAddress`, `txHistorySpecificTransactionDetailByTxhash`

### Options

```ts
type SDKOptions = {
  baseUrl?: string; // default: 'https://web3.okx.com'
  timeoutMs?: number; // default: 10000
  credentials?: {
    apiKey: string;
    secretKey: string;
    passphrase: string;
    projectId: string;
  };
};
```

## Error model

- Non-2xx responses throw with the raw body.
- OKX errors surface as `OKXError <code>: <msg>`.
- Retries, caching, and rate limiting are left to your application.

## Official docs

- Market Price API: https://web3.okx.com/build/dev-docs/dex-api/dex-market-price-reference
- Index Price API: https://web3.okx.com/build/dev-docs/dex-api/dex-index-price-reference
- Token API: https://web3.okx.com/build/dev-docs/dex-api/dex-market-token-reference
- Balance API: https://web3.okx.com/build/dev-docs/dex-api/dex-balance-reference
- Transaction History API: https://web3.okx.com/build/dev-docs/dex-api/dex-tx-history-reference

## License

MIT
