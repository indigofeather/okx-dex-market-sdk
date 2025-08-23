# OKX DEX Market SDK

A minimal, class‑based TypeScript SDK for OKX DEX Market and Balance APIs. It focuses on a clean developer experience and predictable behavior by exposing a single entry point class and keeping the transport logic simple and explicit.

## Highlights

- Single entry point: `OKXDexSDK` class
- Signed requests with stable query serialization
- Minimal dependencies (`undici`, `crypto-js`)
- No hidden retries or backoff (you own the control flow)
- ESM and CJS builds with bundled types

## Design Principles

- Simplicity over magic: no implicit global state or side effects.
- Safety by default: rejects on non‑2xx responses and API error codes.
- Environment‑agnostic: credentials are provided by environment variables or constructor options; the SDK itself doesn’t read or write files.

## Environment Variables

The SDK reads credentials from environment variables by default. In your application, define the following variables (for local development, you can place them in a `.env` file and load with a tool like `dotenv`).

Required variables:

- `OKX_API_KEY`: Your OKX API key
- `OKX_SECRET_KEY`: Your OKX API secret
- `OKX_API_PASSPHRASE`: The passphrase set when creating the key
- `OKX_PROJECT_ID`: Your OKX project identifier

Example `.env` contents:

```
OKX_API_KEY=your_api_key_here
OKX_SECRET_KEY=your_secret_key_here
OKX_API_PASSPHRASE=your_passphrase_here
OKX_PROJECT_ID=your_project_id_here
```

Security Notes:

- DO NOT COMMIT `.env` files. Use `.env.example` to indicate required keys.
- In production, set these via your platform’s secret manager (Vercel/Netlify/Cloudflare Workers/AWS/GCP/etc.).
- If you prefer not to use environment variables, you can pass credentials via the `OKXDexSDK` constructor (see upcoming usage section).

## Status

Active development. More endpoints and types will be added. Usage examples will be documented after the remaining methods are finalized.

## Usage

Initialize the SDK and call methods. The SDK returns parsed JSON data (the `data` field if the API responds with `{ code, msg, data }`). Non‑2xx HTTP or API errors (`code !== '0'`) throw exceptions.

Basic initialization (reads credentials from environment variables):

```
import { OKXDexSDK } from 'okx-dex-market-sdk';

const sdk = new OKXDexSDK();
```

Initialization with explicit credentials:

```
import { OKXDexSDK } from 'okx-dex-market-sdk';

const sdk = new OKXDexSDK({
  credentials: {
    apiKey: process.env.OKX_API_KEY!,
    secretKey: process.env.OKX_SECRET_KEY!,
    passphrase: process.env.OKX_API_PASSPHRASE!,
    projectId: process.env.OKX_PROJECT_ID!,
  },
  // baseUrl: 'https://web3.okx.com',
  // timeoutMs: 10000,
});
```

Error handling example:

```
try {
  const chains = await sdk.marketPriceChains({ chainIndex: '1' });
} catch (err) {
  console.error('Request failed:', err);
}
```

### Balance APIs (Links in each item)

- balanceChains(): Retrieve chains supported by the Balance API.

```
const chains = await sdk.balanceChains();
```

- balanceTotalValue({ address, chains, assetType?, excludeRiskToken? }): Retrieve total balance across tokens and DeFi assets.

```
const total = await sdk.balanceTotalValue({
  address: '0xabc...',
  chains: ['1','137'],
  assetType: '0',
  excludeRiskToken: '0',
});
```

- balanceTotalTokenBalances({ address, chains, excludeRiskToken? }): Retrieve total token balances for an address.

```
const tokens = await sdk.balanceTotalTokenBalances({
  address: '0xabc...',
  chains: ['1','137'],
  excludeRiskToken: '0',
});
```

- balanceSpecificTokenBalance({ address, tokenContractAddresses, excludeRiskToken? }): Retrieve balances for specific tokens.

```
const specific = await sdk.balanceSpecificTokenBalance({
  address: '0xabc...',
  tokenContractAddresses: [
    { chainIndex: '1', tokenContractAddress: '0xToken...' },
    { chainIndex: '137', tokenContractAddress: '0xToken...' },
  ],
  excludeRiskToken: '0',
});
```

### Market Price APIs (Links in each item)

- marketPriceChains({ chainIndex? }): Retrieve chains supported by the Market API.

```
const chains = await sdk.marketPriceChains({ chainIndex: '1' });
```

- marketPrice({ chainIndex, tokenContractAddress }): Retrieve the latest price of a token.

```
const price = await sdk.marketPrice({
  chainIndex: '1',
  tokenContractAddress: '0xToken...',
});
```

- marketPriceInfo({ tokenContractAddresses }): Retrieve the latest prices for multiple tokens.

```
const prices = await sdk.marketPriceInfo({
  tokenContractAddresses: [
    { chainIndex: '1', tokenContractAddress: '0xTokenA' },
    { chainIndex: '137', tokenContractAddress: '0xTokenB' },
  ],
});
```

- marketTrades({ chainIndex, tokenContractAddress, after?, limit? }): Retrieve recent trades of a token.

```
const trades = await sdk.marketTrades({
  chainIndex: '1',
  tokenContractAddress: '0xToken...',
  limit: 50,
});
```

- marketCandlesticks({ chainIndex, tokenContractAddress, after?, before?, bar?, limit? }): Retrieve candlestick data.

```
const candles = await sdk.marketCandlesticks({
  chainIndex: '1',
  tokenContractAddress: '0xToken...',
  bar: '1m',
  limit: 100,
});
```

- marketCandlesticksHistory({ chainIndex, tokenContractAddress, after?, before?, bar?, limit? }): Retrieve historical candlesticks (if supported by API).

```
const history = await sdk.marketCandlesticksHistory({
  chainIndex: '1',
  tokenContractAddress: '0xToken...',
  bar: '5m',
  limit: 200,
});
```

### Index Price APIs (Links in each item)

- indexPriceChains(): Retrieve chains supported by Index Price API.

```
const chains = await sdk.indexPriceChains();
```

- indexPrice({ tokenContractAddresses }): Retrieve current index price for multiple tokens.

```
const indexPrices = await sdk.indexPrice({
  tokenContractAddresses: [
    { chainIndex: '1', tokenContractAddress: '0xTokenA' },
    { chainIndex: '137', tokenContractAddress: '0xTokenB' },
  ],
});
```

- historicalIndexPrice({ chainIndex, tokenContractAddress?, limit?, cursor?, begin?, end?, period? }): Retrieve historical index price.

```
const historical = await sdk.historicalIndexPrice({
  chainIndex: '1',
  tokenContractAddress: '0xToken...',
  period: '5m',
  limit: 100,
});
```

### Transaction History APIs (Links in each item)

- txHistoryChains(): Retrieve chains supported by Transaction History API.

```
const chains = await sdk.txHistoryChains();
```

- txHistoryTransactionsByAddress({ address, chains, tokenContractAddress?, begin?, end?, cursor?, limit? }): Retrieve transactions for an address.

```
const txs = await sdk.txHistoryTransactionsByAddress({
  address: '0xabc...',
  chains: ['1','137'],
  begin: '1718928000000', // ms timestamp string
  limit: 50,
});
```

- txHistorySpecificTransactionDetailByTxhash({ chainIndex, txHash, itype? }): Retrieve a specific transaction detail.

```
const detail = await sdk.txHistorySpecificTransactionDetailByTxhash({
  chainIndex: '1',
  txHash: '0xTxHash...',
});
```

## Official Docs

- Balance
  - Get Supported Chains: https://web3.okx.com/build/dev-docs/dex-api/dex-balance-chains
  - Get Total Value: https://web3.okx.com/build/dev-docs/dex-api/dex-balance-total-value
  - Get Total Token Balances: https://web3.okx.com/build/dev-docs/dex-api/dex-balance-total-token-balances
  - Get Specific Token Balance: https://web3.okx.com/build/dev-docs/dex-api/dex-balance-specific-token-balance
- Market Price
  - Get Supported Chains: https://web3.okx.com/build/dev-docs/dex-api/dex-market-price-chains
  - Get Price: https://web3.okx.com/build/dev-docs/dex-api/dex-market-price
  - Get Batch Token Price: https://web3.okx.com/build/dev-docs/dex-api/dex-market-price-info
  - Get Trades: https://web3.okx.com/build/dev-docs/dex-api/dex-market-trades
  - Get Candlesticks: https://web3.okx.com/build/dev-docs/dex-api/dex-market-candlesticks
  - Get Historical Candlesticks: https://web3.okx.com/build/dev-docs/dex-api/dex-market-candlesticks-history
- Index Price
  - Get Supported Chains: https://web3.okx.com/build/dev-docs/dex-api/dex-index-price-chains
  - Get Token Index Price: https://web3.okx.com/build/dev-docs/dex-api/dex-index-price
  - Get Historical Index Price: https://web3.okx.com/build/dev-docs/dex-api/dex-historical-index-price
- Transaction History
  - Get Supported Chains: https://web3.okx.com/build/dev-docs/dex-api/dex-tx-history-chains
  - Get History by Address: https://web3.okx.com/build/dev-docs/dex-api/dex-tx-history-transactions-by-address
  - Get Specific Transaction: https://web3.okx.com/build/dev-docs/dex-api/dex-tx-history-specific-transaction-detail-by-txhash

## License

This project is licensed under the MIT License. See `LICENSE` for details.
