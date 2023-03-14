import { providers as prov } from "ethers";
import pRetry from "p-retry";

import isRetryable from "./isRetryable";

interface Logger {
  warn: (...args: unknown[]) => void;
}

/**
 * RotateProvider gets a list of other providers
 * It will use first available provider, and when it fails will switch to next, in round-robin manner
 * If for single network call all providers fail, it will fail as well
 */
export class RotateProvider extends prov.BaseProvider {
  private readonly providers: prov.JsonRpcProvider[];
  private readonly logger?: Logger;
  private i = 0;

  constructor(
    providers: prov.JsonRpcProvider[],
    network?: prov.Networkish,
    logger?: Logger,
  ) {
    if (providers.length === 0) {
      throw new Error("at least 1 provider is required");
    }

    let networkOrReady: prov.Networkish | Promise<prov.Network> | undefined =
      network;

    // The network is unknown, query the JSON-RPC for it
    if (!networkOrReady) {
      networkOrReady = new Promise((resolve, reject) => {
        setTimeout(() => {
          this.detectNetwork().then(
            network => {
              resolve(network);
            },
            error => {
              reject(error);
            },
          );
        }, 0);
      });
    }

    super(networkOrReady);
    this.providers = providers;
    this.logger = logger;
  }

  async detectNetwork(): Promise<prov.Network> {
    if (this.network) {
      return this.network;
    }
    // assume that all providers return same chain id and do not compare
    // get the first one because some might be unreachable
    for (const provider of this.providers) {
      try {
        this._network = await provider.getNetwork();
        break;
      } catch {}
    }
    if (!this.network) {
      throw new Error("all providers are unreachable");
    }
    return this.network;
  }

  override async perform(
    method: string,
    params: { [name: string]: any },
  ): Promise<any> {
    let next = this.i;
    return pRetry(
      async () => {
        const resp = this.providers[next].perform(method, params);
        this.i = next;
        return resp;
      },
      {
        retries: this.providers.length,
        minTimeout: 0,
        onFailedAttempt: e => {
          if (
            isRetryable(e) ||
            (e instanceof Error && e.message === "retry limit reached")
          ) {
            next = (next + 1) % this.providers.length;
            this.logger?.warn(
              `switching to provider number #${next} due to: ${e}`,
            );
          } else {
            throw e;
          }
        },
      },
    );
  }
}
