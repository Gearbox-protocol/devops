import { providers, utils } from "ethers";
import pRetry from "p-retry";

import isRetryable from "./isRetryable";

export class RetryProvider extends providers.StaticJsonRpcProvider {
  public attempts: number;

  constructor(
    attempts: number,
    url?: utils.ConnectionInfo | string,
    network?: providers.Networkish,
  ) {
    super(url, network);
    this.attempts = attempts;
  }

  override async perform(
    method: string,
    params: { [name: string]: any },
  ): Promise<any> {
    if (this.attempts === 0) {
      return super.perform(method, params);
    }
    return pRetry(async () => super.perform(method, params), {
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
}
