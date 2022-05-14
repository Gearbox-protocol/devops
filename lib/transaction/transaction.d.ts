import { TransactionReceipt } from "@ethersproject/providers";
import { ContractTransaction, ContractFactory, Contract } from "ethers";
import { Logger } from "tslog";
export declare function waitForTransaction(transaction: Promise<ContractTransaction>, logger?: Logger): Promise<TransactionReceipt>;
export declare type ContractFactoryConstructor<T extends ContractFactory> = new (...args: any[]) => T;
export declare type ContractConstructor<T extends Contract> = new (...args: any[]) => T;
export declare function deploy<T extends Contract>(name: string, logger: Logger | undefined, ...args: any[]): Promise<T>;
