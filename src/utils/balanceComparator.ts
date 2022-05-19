import { Provider } from "@ethersproject/providers";
import {
  IERC20__factory,
  NetworkType,
  SupportedToken,
  tokenDataByNetwork
} from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
import { expect } from "./expect";
import { detectNetwork } from "./getNetwork";

export class BalanceComparator<T extends keyof any> {
  protected readonly _list: Array<SupportedToken>;
  protected readonly _provider: Provider;
  protected _networkType: NetworkType | undefined;
  protected _balanceSnapshot: Partial<
    Record<T, Record<string, Partial<Record<SupportedToken, BigNumber>>>>
  > = {};

  constructor(list: Array<SupportedToken>, _provider: Provider) {
    this._provider = _provider;
    this._list = list;
  }

  async storeBalances(stage: T, holder: string) {
    let balances: Partial<Record<SupportedToken, BigNumber>> = {};

    const network = await this.getNetwork();

    for (let symbol of this._list) {
      let token = IERC20__factory.connect(
        tokenDataByNetwork[network][symbol],
        this._provider
      );
      balances[symbol] = await token.balanceOf(holder);
    }

    this._balanceSnapshot[stage] = {
      ...this._balanceSnapshot[stage],
      [holder]: balances
    };
  }

  async compareBalances(stage: T, holder: string, compareWith: string) {
    const network = await this.getNetwork();

    for (let symbol of this._list) {
      let token = IERC20__factory.connect(
        tokenDataByNetwork[network][symbol],
        this._provider
      );

      expect(await token.balanceOf(compareWith)).to.be.eq(
        this.getBalance(stage, holder, symbol)
      );
    }
  }

  async getNetwork(): Promise<NetworkType> {
    if (!this._networkType) {
      this._networkType = await detectNetwork();
    }
    return this._networkType;
  }

  getBalance(
    stage: T,
    account: string,
    token: SupportedToken
  ): BigNumber | undefined {
    return this._balanceSnapshot[stage]?.[account]?.[token];
  }
}
