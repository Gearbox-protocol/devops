import { Provider } from "@ethersproject/providers";
import {
  IERC20__factory,
  NetworkType,
  SupportedToken,
  tokenDataByNetwork,
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

  public constructor(list: Array<SupportedToken>, _provider: Provider) {
    this._provider = _provider;
    this._list = list;
  }

  public async takeSnapshot(stage: T, holder: string) {
    let balances: Partial<Record<SupportedToken, BigNumber>> = {};

    const network = await this.getNetwork();

    for (let symbol of this._list) {
      const token = IERC20__factory.connect(
        tokenDataByNetwork[network][symbol],
        this._provider,
      );
      balances[symbol] = await token.balanceOf(holder);
    }

    this._balanceSnapshot[stage] = {
      ...this._balanceSnapshot[stage],
      [holder]: balances,
    };
  }

  public compareSnapshots(stage: T, holder: string, compareWith: string) {
    for (let symbol of this._list) {
      expect(
        this.getBalanceOrThrow(stage, compareWith, symbol),
        ` ${String(stage)}: different balances for ${symbol}`
      ).to.be.eq(this.getBalanceOrThrow(stage, holder, symbol));
    }
  }

  public compareAllSnapshots(holder: string, compareWith: string) {
    // Seems to be working just fine
    // eslint-disable-next-line guard-for-in
    for (let stage in this._balanceSnapshot) {
      this.compareSnapshots(stage, holder, compareWith);
    }
  }

  getBalanceOrThrow(
    stage: T,
    account: string,
    token: SupportedToken
  ): BigNumber {
    const stageData = this._balanceSnapshot[stage];
    if (!stageData)
      throw new Error(`No balances exist for stage ${String(stage)}`);

    const accountData = stageData[account];
    if (!accountData)
      throw new Error(
        `No balances exist for stage ${String(stage)} and account ${account}`,
      );

    const balance = accountData[token];
    if (!balance)
      throw new Error(
        `No balance exists for stage ${String(
          stage,
        )}, account ${account} and token ${token}`,
      );

    return balance;
  }

  protected async getNetwork(): Promise<NetworkType> {
    if (!this._networkType) {
      this._networkType = await detectNetwork();
    }
    return this._networkType;
  }
}