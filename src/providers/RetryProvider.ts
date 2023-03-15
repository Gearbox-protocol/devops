import {
  Filter,
  FilterByBlockHash,
  Log,
} from "@ethersproject/abstract-provider";
import { resolveProperties } from "@ethersproject/properties";
import { providers, utils } from "ethers";
import pRetry from "p-retry";

import isBlockRange from "./isBlockRange";
import isRetryable from "./isRetryable";

export interface RetryProviderOptions {
  /**
   * Number of retry attempts
   */
  attempts?: number;
  /**
   * Max number of blocks for eth_getLogs
   * If undefined or 0, no pagination will be attempted
   */
  filterLogRange?: number;
  /**
   * Min block in in queryFilter
   */
  deployBlock?: number;
  network?: providers.Networkish;
}

export class RetryProvider extends providers.StaticJsonRpcProvider {
  private readonly attempts: number;
  private readonly deployBlock: number;
  private readonly filterLogRange?: number;

  constructor(
    url: utils.ConnectionInfo | string,
    options: RetryProviderOptions = {},
  ) {
    super(url, options.network);
    this.attempts = options.attempts ?? 3;
    this.deployBlock = options.deployBlock ?? 0;
    // because it will be tried first with full range and then divided before first paginated call
    this.filterLogRange = options.filterLogRange
      ? options.filterLogRange * 2
      : undefined;
  }

  override async send(method: string, params: Array<any>): Promise<any> {
    if (this.attempts === 0) {
      return super.send(method, params);
    }
    return pRetry(async () => super.send(method, params), {
      retries: this.attempts,
      minTimeout: 200,
      maxTimeout: 1000,
      onFailedAttempt: e => {
        if (!isRetryable(e)) {
          throw e;
        }
      },
    });
  }

  override async getLogs(
    fltr: Filter | FilterByBlockHash | Promise<Filter | FilterByBlockHash>,
  ): Promise<Array<Log>> {
    const params = await resolveProperties({ filter: this._getFilter(fltr) });
    if ("blockHash" in params.filter || !this.filterLogRange) {
      return super.getLogs(params.filter);
    }
    return this.getLogsPaginated(params.filter);
  }

  private async getLogsPaginated(filter: Filter): Promise<Log[]> {
    const firstBlock = filter.fromBlock
      ? Math.max(Number(filter.fromBlock), this.deployBlock)
      : this.deployBlock;

    let lastBlock: number;
    if (!filter.toBlock) {
      lastBlock = await this.getBlockNumber();
    } else {
      lastBlock = Number(filter.toBlock);
    }
    let result: Log[] = [];
    let from = firstBlock;
    let to = lastBlock;
    let filterLogRange = this.filterLogRange;
    if (!filterLogRange) {
      throw new Error("filter log range undefined");
    }

    while (from <= lastBlock) {
      try {
        const logs = await super.getLogs({
          ...filter,
          fromBlock: from,
          toBlock: to,
        });
        result = [...result, ...logs];
        from = to + 1;
        to = Math.min(lastBlock, from + filterLogRange);
      } catch (e) {
        if (isBlockRange(e)) {
          filterLogRange = Math.floor((filterLogRange + 1) / 2) - 1;
          to = from + filterLogRange;
        } else {
          throw e;
        }
      }
    }
    return result;
  }
}
