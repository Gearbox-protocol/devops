import { defineReadOnly } from "@ethersproject/properties";
import { providers as prov } from "ethers";
import pRetry from "p-retry";

import isRetryable from "./isRetryable";

interface Logger {
  warn: (...args: unknown[]) => void;
}

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
    const networks = await Promise.all(this.providers.map(c => c.getNetwork()));
    console.log(networks.length, this.providers.length);
    const network = networks[0];
    const ok = networks.every(n => {
      console.log(n);
      return n.chainId === network.chainId;
    });
    if (!ok) {
      throw new Error("chain id mismatch");
    }
    defineReadOnly(this, "_network", network);
    return network;
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
            this.logger?.warn(`switching to provider number #${next}`);
          } else {
            throw e;
          }
        },
      },
    );
  }
}
