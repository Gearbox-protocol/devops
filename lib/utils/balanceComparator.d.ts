import { Provider } from "@ethersproject/providers";
import { NetworkType, SupportedToken } from "@gearbox-protocol/sdk";
import { BigNumber } from "ethers";
export declare class BalanceComparator<T extends keyof any> {
    protected readonly _list: Array<SupportedToken>;
    protected readonly _provider: Provider;
    protected _networkType: NetworkType | undefined;
    protected _balanceSnapshot: Partial<Record<T, Record<string, Partial<Record<SupportedToken, BigNumber>>>>>;
    constructor(list: Array<SupportedToken>, _provider: Provider);
    storeBalances(stage: T, holder: string): Promise<void>;
    compareBalances(stage: T, holder: string, compareWith: string): Promise<void>;
    getNetwork(): Promise<NetworkType>;
    getBalance(stage: T, account: string, token: SupportedToken): BigNumber | undefined;
}
