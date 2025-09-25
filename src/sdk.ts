import { OKXClient } from "./client";
import {
  API_VERSION,
  BASE_URL,
  type Credentials,
  getCredentialsFromEnv,
} from "./utils";

type SDKOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  credentials?: Credentials;
};

/**
 * OKX DEX Market SDK
 */
export class OKXDexSDK {
  private client: OKXClient;

  constructor(opts?: SDKOptions) {
    const credentials = opts?.credentials ?? getCredentialsFromEnv();
    this.client = new OKXClient({
      credentials,
      baseUrl: opts?.baseUrl ?? BASE_URL,
      timeoutMs: opts?.timeoutMs,
    });
  }

  // Market Price APIs
  /**
   * Market API > Market Price API > Get Supported Chains
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-price-chains
   * @param params Optional filter
   * @param params.chainIndex Optional chain index
   * @returns Supported chains
   */
  marketPriceChains(params?: { chainIndex?: string }) {
    return this.client.getJSON<
      {
        chainIndex: string;
        chainLogoUrl: string;
        chainName: string;
        chainSymbol: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/supported/chain`, {
      chainIndex: params?.chainIndex,
    });
  }

  /**
   * Market API > Market Price API > Get Price
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-price
   * @param params.chainIndex Chain index
   * @param params.tokenContractAddress Token contract address
   * @returns Latest price info
   */
  marketPrice(params: { chainIndex: string; tokenContractAddress: string }) {
    const { chainIndex, tokenContractAddress } = params;
    return this.client.postJSON<
      {
        chainIndex: string;
        price: string;
        time: string;
        tokenContractAddress: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/price`, [
      { chainIndex, tokenContractAddress },
    ]);
  }

  /**
   * Market API > Market Price API > Get Trades
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-trades
   * @param params.chainIndex Chain index
   * @param params.tokenContractAddress Token contract address
   * @param params.after Optional cursor/timestamp (string)
   * @param params.limit Optional page size
   * @returns Recent trades
   */
  marketTrades(params: {
    chainIndex: string;
    tokenContractAddress: string;
    after?: string;
    limit?: number;
  }) {
    const { chainIndex, tokenContractAddress, after, limit = 100 } = params;
    return this.client.getJSON<
      {
        chainIndex: string;
        changedTokenInfo: {
          amount: string;
          tokenAddress: string;
          tokenSymbol: string;
        }[];
        dexName: string;
        id: string;
        isFiltered: string;
        poolLogoUrl: string;
        price: string;
        time: string;
        tokenContractAddress: string;
        txHashUrl: string;
        type: string;
        userAddress: string;
        volume: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/trades`, {
      chainIndex,
      tokenContractAddress,
      after,
      limit,
    });
  }

  /**
   * Market API > Market Price API > Get Candlesticks
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-candlesticks
   * @param params.chainIndex Chain index
   * @param params.tokenContractAddress Token contract address
   * @param params.after Optional start cursor/timestamp (string)
   * @param params.before Optional end cursor/timestamp (string)
   * @param params.bar Bar size (e.g. 1m, 5m, 15m, 1h)
   * @param params.limit Optional number of items (default 100)
   * @returns Candlestick data
   */
  marketCandlesticks(params: {
    chainIndex: string;
    tokenContractAddress: string;
    after?: string;
    before?: string;
    bar?: string;
    limit?: number;
  }) {
    const {
      chainIndex,
      tokenContractAddress,
      after,
      before,
      bar = "1m",
      limit = 100,
    } = params;
    return this.client.getJSON<string[][]>(
      `/api/${API_VERSION}/dex/market/candles`,
      {
        chainIndex,
        tokenContractAddress,
        after,
        before,
        bar,
        limit,
      }
    );
  }

  /**
   * Market API > Market Price API > Get Historical Candlesticks
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-candlesticks-history
   * @param params.chainIndex Chain index
   * @param params.tokenContractAddress Token contract address
   * @param params.after Optional start cursor/timestamp (string)
   * @param params.before Optional end cursor/timestamp (string)
   * @param params.bar Bar size (e.g. 1m, 5m, 15m, 1h)
   * @param params.limit Optional number of items (default 100)
   * @returns Historical candlestick data
   */
  marketCandlesticksHistory(params: {
    chainIndex: string;
    tokenContractAddress: string;
    after?: string;
    before?: string;
    bar?: string;
    limit?: number;
  }) {
    const {
      chainIndex,
      tokenContractAddress,
      after,
      before,
      bar = "1m",
      limit = 100,
    } = params;
    return this.client.getJSON<string[][]>(
      `/api/${API_VERSION}/dex/market/historical-candles`,
      {
        chainIndex,
        tokenContractAddress,
        after,
        before,
        bar,
        limit,
      }
    );
  }

  // Index Price APIs
  /**
   * Market API > Index Price API > Get Supported Chains
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-index-price-chains
   * @returns Supported chains for index price
   */
  indexPriceChains() {
    return this.client.getJSON<
      {
        name: string;
        logoUrl: string;
        shortName: string;
        chainIndex: string;
      }[]
    >(`/api/${API_VERSION}/dex/balance/supported/chain`);
  }

  /**
   * Market API > Index Price API > Get Token Index Price
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-index-price
   * @param params.tokenContractAddresses Array of { chainIndex, tokenContractAddress }
   * @returns Current index price for given tokens
   */
  indexPrice(params: {
    tokenContractAddresses: {
      chainIndex: string;
      tokenContractAddress: string;
    }[];
  }) {
    return this.client.postJSON<
      {
        chainIndex: string;
        time: string;
        price: string;
        tokenContractAddress: string;
      }[]
    >(
      `/api/${API_VERSION}/dex/index/current-price`,
      params.tokenContractAddresses
    );
  }

  /**
   * Market API > Index Price API > Get Historical Index Price
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-historical-index-price
   * @param params.chainIndex Chain index
   * @param params.tokenContractAddress Optional token contract address
   * @param params.limit Optional page size (default 50)
   * @param params.cursor Optional pagination cursor
   * @param params.begin Optional start time (ms)
   * @param params.end Optional end time (ms)
   * @param params.period Optional period (e.g. 5m, 1h)
   * @returns Historical index price
   */
  historicalIndexPrice(params: {
    chainIndex: string;
    tokenContractAddress?: string;
    limit?: number;
    cursor?: string;
    begin?: string;
    end?: string;
    period?: string;
  }) {
    const {
      chainIndex,
      tokenContractAddress,
      limit = 50,
      cursor,
      begin,
      end,
      period,
    } = params;
    return this.client.getJSON<
      {
        cursor: string;
        prices: {
          time: string;
          price: string;
        }[];
      }[]
    >(`/api/${API_VERSION}/dex/index/historical-price`, {
      chainIndex,
      tokenContractAddress,
      limit,
      cursor,
      begin,
      end,
      period,
    });
  }

  // Token APIs
  /**
   * Market API > Token API > Token Search
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-token-search
   * @param params.chains Array of chain indices
   * @param params.search Search string
   * @returns Token list
   */
  marketTokenSearch(params: { chains: string[]; search: string }) {
    const { chains, search } = params;
    return this.client.getJSON<
      {
        chainIndex: string;
        change: string;
        decimal: string;
        explorerUrl: string;
        holders: string;
        liquidity: string;
        marketCap: string;
        price: string;
        tagList: {
          communityRecognized: boolean;
        };
        tokenContractAddress: string;
        tokenLogoUrl: string;
        tokenName: string;
        tokenSymbol: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/token/search`, {
      chains: chains.join(","),
      search,
    });
  }

  /**
   * Market API > Token API > Token Basic Information
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-token-basic-info
   * @param params Array of { chainIndex, tokenContractAddress }
   * @returns Token basic info
   */
  marketTokenBasicInfo(
    params: {
      chainIndex: string;
      tokenContractAddress: string;
    }[]
  ) {
    return this.client.postJSON<
      {
        chainIndex: string;
        decimal: string;
        tagList: {
          communityRecognized: boolean;
        };
        tokenContractAddress: string;
        tokenLogoUrl: string;
        tokenName: string;
        tokenSymbol: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/token/basic-info`, params);
  }

  /**
   * Market API > Token API > Token Trading Information
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-token-price-info
   * @param params Array of { chainIndex, tokenContractAddress }
   * @returns Token trading info
   */
  marketTokenPriceInfo(
    params: {
      chainIndex: string;
      tokenContractAddress: string;
    }[]
  ) {
    return this.client.postJSON<
      {
        chainIndex: string;
        circSupply: string;
        holders: string;
        liquidity: string;
        marketCap: string;
        maxPrice: string;
        minPrice: string;
        price: string;
        priceChange1H: string;
        priceChange24H: string;
        priceChange4H: string;
        priceChange5M: string;
        time: string;
        tokenContractAddress: string;
        tradeNum: string;
        txs1H: string;
        txs24H: string;
        txs4H: string;
        txs5M: string;
        volume1H: string;
        volume24H: string;
        volume4H: string;
        volume5M: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/price-info`, params);
  }

  /**
   * Market API > Token API > Token Ranking List
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-token-ranking
   * @param params.chains Array of chain indices
   * @param params.sortBy Sort by field
   * @param params.timeFrame Time frame
   */
  marketTokenRanking(params: {
    chains: string[];
    sortBy: string;
    timeFrame: string;
  }) {
    const { chains, sortBy, timeFrame } = params;
    return this.client.getJSON<
      {
        chainIndex: string;
        change: string;
        firstTradeTime: string;
        holders: string;
        liquidity: string;
        marketCap: string;
        price: string;
        tokenContractAddress: string;
        tokenLogoUrl: string;
        tokenSymbol: string;
        txs: string;
        txsBuy: string;
        txsSell: string;
        uniqueTraders: string;
        volume: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/token/toplist`, {
      chains: chains.join(","),
      sortBy,
      timeFrame,
    });
  }

  /**
   * Market API > Token API > Top Token Holder
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-market-token-holder
   * @param params.chainIndex Chain index
   * @param params.tokenContractAddress Token contract address
   * @returns Top token holder
   */
  marketTokenHolder(params: {
    chainIndex: string;
    tokenContractAddress: string;
  }) {
    const { chainIndex, tokenContractAddress } = params;
    return this.client.getJSON<
      {
        holdAmount: string;
        holderWalletAddress: string;
      }[]
    >(`/api/${API_VERSION}/dex/market/token/holder`, {
      chainIndex,
      tokenContractAddress,
    });
  }

  // Balance APIs
  /**
   * Market API > Balance API > Get Supported Chains
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-balance-chains
   * @returns Supported chains for balance endpoints
   */
  balanceChains() {
    return this.client.getJSON<
      {
        name: string;
        logoUrl: string;
        shortName: string;
        chainIndex: string;
      }[]
    >(`/api/${API_VERSION}/dex/balance/supported/chain`);
  }

  /**
   * Market API > Balance API > Get Total Value
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-balance-total-value
   * @param params.address Address to query
   * @param params.chains Array of chain indices
   * @param params.assetType Optional asset type (default '0')
   * @param params.excludeRiskToken Optional flag (default '0')
   * @returns Total portfolio value
   */
  balanceTotalValue(params: {
    address: string;
    chains: string[];
    assetType?: string;
    excludeRiskToken?: string;
  }) {
    const { address, chains, assetType = "0", excludeRiskToken = "0" } = params;
    return this.client.getJSON<{ totalValue: string }[]>(
      `/api/${API_VERSION}/dex/balance/total-value-by-address`,
      {
        address,
        chains: chains.join(","),
        assetType,
        excludeRiskToken,
      }
    );
  }

  /**
   * Market API > Balance API > Get Total Token Balances
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-balance-total-token-balances
   * @param params.address Address to query
   * @param params.chains Array of chain indices
   * @param params.excludeRiskToken Optional flag (default '0')
   * @returns Aggregated token balances
   */
  balanceTotalTokenBalances(params: {
    address: string;
    chains: string[];
    excludeRiskToken?: string;
  }) {
    const { address, chains, excludeRiskToken = "0" } = params;
    return this.client.getJSON<
      {
        tokenAssets: {
          chainIndex: string;
          tokenContractAddress: string;
          symbol: string;
          balance: string;
          tokenPrice: string;
          isRiskToken: boolean;
          rawBalance: string;
          address: string;
        }[];
      }[]
    >(`/api/${API_VERSION}/dex/balance/all-token-balances-by-address`, {
      address,
      chains: chains.join(","),
      excludeRiskToken,
    });
  }

  /**
   * Market API > Balance API > Get Specific Token Balance
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-balance-specific-token-balance
   * @param params.address Address to query
   * @param params.tokenContractAddresses Array of { chainIndex, tokenContractAddress }
   * @param params.excludeRiskToken Optional flag (default '0')
   * @returns Balances for specified tokens
   */
  balanceSpecificTokenBalance(params: {
    address: string;
    tokenContractAddresses: {
      chainIndex: string;
      tokenContractAddress: string;
    }[];
    excludeRiskToken?: string;
  }) {
    const { address, tokenContractAddresses, excludeRiskToken = "0" } = params;
    return this.client.postJSON<
      {
        tokenAssets: {
          chainIndex: string;
          tokenContractAddress: string;
          symbol: string;
          balance: string;
          tokenPrice: string;
          isRiskToken: boolean;
          rawBalance: string;
          address: string;
        }[];
      }[]
    >(`/api/${API_VERSION}/dex/balance/token-balances-by-address`, {
      address,
      tokenContractAddresses,
      excludeRiskToken,
    });
  }

  // Transaction History APIs
  /**
   * Market API > Transaction History API > Get Supported Chains
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-tx-history-chains
   * @returns Supported chains for transaction history
   */
  txHistoryChains() {
    return this.client.getJSON<
      {
        name: string;
        logoUrl: string;
        shortName: string;
        chainIndex: string;
      }[]
    >(`/api/${API_VERSION}/dex/balance/supported/chain`);
  }

  /**
   * Market API > Transaction History API > Get History by Address
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-tx-history-transactions-by-address
   * @param params.address Address to query
   * @param params.chains Array of chain indices
   * @param params.tokenContractAddress Optional token filter
   * @param params.begin Optional start time (ms)
   * @param params.end Optional end time (ms)
   * @param params.cursor Optional pagination cursor
   * @param params.limit Optional page size
   * @returns Transaction list with pagination
   */
  txHistoryTransactionsByAddress(params: {
    address: string;
    chains: string[];
    tokenContractAddress?: string;
    begin?: string;
    end?: string;
    cursor?: string;
    limit?: number;
  }) {
    const { address, chains, tokenContractAddress, begin, end, cursor, limit } =
      params;
    return this.client.getJSON<
      {
        cursor: string;
        transactions: {
          chainIndex: string;
          txHash: string;
          itype: string;
          methodId: string;
          nonce: string;
          txTime: string;
          from: {
            address: string;
            amount: string;
          }[];
          to: {
            address: string;
            amount: string;
          }[];
          tokenContractAddress: string;
          amount: string;
          symbol: string;
          txFee: string;
          txStatus: "success";
          hitBlacklist: boolean;
        }[];
      }[]
    >(`/api/${API_VERSION}/dex/post-transaction/transactions-by-address`, {
      address,
      chains: chains?.join(","),
      tokenContractAddress,
      begin,
      end,
      cursor,
      limit,
    });
  }

  /**
   * Market API > Transaction History API > Get Specific Transaction
   * @link https://web3.okx.com/build/dev-docs/dex-api/dex-tx-history-specific-transaction-detail-by-txhash
   * @param params.chainIndex Chain index
   * @param params.txHash Transaction hash
   * @param params.itype Optional internal type
   * @returns Transaction detail
   */
  txHistorySpecificTransactionDetailByTxhash(params: {
    chainIndex: string;
    txHash: string;
    itype?: string;
  }) {
    const { chainIndex, txHash, itype } = params;
    return this.client.getJSON<
      {
        chainIndex: string;
        height: string;
        txTime: string;
        txhash: string;
        gasLimit: string;
        gasUsed: string;
        gasPrice: string;
        nonce: string;
        symbol: string;
        amount: string;
        txStatus: string;
        methodId: string;
        l1OriginHash: string;
        txFee: string;
        fromDetails: {
          address: string;
          vinIndex: string;
          preVoutIndex: string;
          txHash: string;
          isContract: boolean;
          amount: string;
        }[];
        toDetails: {
          address: string;
          voutIndex: string;
          isContract: boolean;
          amount: string;
        }[];

        internalTransactionDetails: {
          from: string;
          to: string;
          isFromContract: boolean;
          isToContract: boolean;
          amount: string;
          txStatus: string;
        }[];
        tokenTransferDetails: {
          from: string;
          to: string;
          isFromContract: boolean;
          isToContract: boolean;
          tokenContractAddress: string;
          symbol: string;
          amount: string;
        }[];
      }[]
    >(`/api/${API_VERSION}/dex/post-transaction/transaction-detail-by-txhash`, {
      chainIndex,
      txHash,
      itype,
    });
  }
}
