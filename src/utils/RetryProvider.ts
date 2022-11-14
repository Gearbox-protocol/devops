import { providers, utils } from "ethers";

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

  send(method: string, params: Array<any>): Promise<any> {
    if (this.attempts === 0) {
      return super.send(method, params);
    }
    return utils.poll(
      async () => {
        try {
          const res = await super.send(method, params);
          return res;
        } catch (e: any) {
          // Retry these 2 types of errors
          if (
            e.code === utils.Logger.errors.SERVER_ERROR ||
            e.code === utils.Logger.errors.NETWORK_ERROR
          ) {
            return undefined;
          }
          throw e;
        }
      },
      { retryLimit: this.attempts },
    );
  }
}
