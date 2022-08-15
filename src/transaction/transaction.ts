import { TransactionReceipt } from "@ethersproject/providers";
import { formatBN } from "@gearbox-protocol/sdk";
import { Contract, ContractFactory, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { Logger } from "tslog";

import { Verifier } from "../verifier";

export async function waitForTransaction(
  transaction: Promise<ContractTransaction>,
  logger?: Logger
): Promise<TransactionReceipt> {
  const request = await transaction;
  const txReceipt = await request.wait();

  if (logger) {
    logger.debug(`Tx: ${txReceipt.transactionHash}`);
    logger.debug(
      `Gas used: ${txReceipt.gasUsed.toString()} @ ${formatBN(
        txReceipt.effectiveGasPrice,
        9
      )} gwei.  Total: ${formatBN(
        txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice),
        18
      )} ETH`
    );
  }

  return txReceipt;
}

export type ContractFactoryConstructor<T extends ContractFactory> = new (
  ...args: any[]
) => T;
export type ContractConstructor<T extends Contract> = new (...args: any[]) => T;

export interface DeployOptions {
  logger?: Logger;
  verifier?: Verifier;
  confirmations?: number;
}

export async function deploy<T extends Contract>(
  name: string,
  options: DeployOptions | undefined,
  ...args: any[]
): Promise<T> {
  const artifact = await ethers.getContractFactory(name);

  const contract = (await artifact.deploy(...args)) as T;
  options?.logger?.debug(`Deploying ${name}...`);
  await contract.deployed();
  const txReceipt = await contract.deployTransaction.wait();
  options?.logger?.debug(`Deployed ${name} to ${contract.address}`);
  options?.logger?.debug(`Tx: ${txReceipt.transactionHash}`);
  options?.logger?.debug(
    `Gas used: ${txReceipt.gasUsed.toString()} @ ${formatBN(
      txReceipt.effectiveGasPrice,
      9
    )} gwei.  Total: ${formatBN(
      txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice),
      18
    )} ETH`
  );

  if (options?.verifier) {
    options.verifier.addContract({
      address: contract.address,
      constructorArguments: args
    });
  }

  if (options?.confirmations) {
    await contract.deployTransaction.wait(options.confirmations);
  }

  return contract;
}
