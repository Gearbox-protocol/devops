import { TransactionReceipt } from "@ethersproject/providers";
import {
  formatBN,
  GOERLI_NETWORK,
  HARDHAT_NETWORK,
  LOCAL_NETWORK,
} from "@gearbox-protocol/sdk";
import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractFactory,
  ContractTransaction,
} from "ethers";
import { ethers } from "hardhat";
import { Logger } from "tslog";

import { Verifier } from "../verifier";

interface GasFee {
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
}

const waitingTime = async () => {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const chainId = await deployer.getChainId();

  return chainId === LOCAL_NETWORK || chainId === HARDHAT_NETWORK
    ? 1
    : chainId === GOERLI_NETWORK
    ? 2
    : 4;
};

const printReceipt = (logger: Logger, txReceipt: TransactionReceipt) => {
  logger.debug(`Tx: ${txReceipt.transactionHash}`);

  const priceInfo = txReceipt.effectiveGasPrice
    ? `@ ${formatBN(txReceipt.effectiveGasPrice, 9)} gwei.  Total: ${formatBN(
        txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice),
        18,
      )} ETH`
    : "";
  logger.debug(`Gas used: ${txReceipt.gasUsed.toString()} ${priceInfo}`);
};

export async function waitForTransaction(
  transaction: Promise<ContractTransaction>,
  logger?: Logger,
  fee?: GasFee,
): Promise<TransactionReceipt> {
  if (fee) {
    await waitForGas(logger, fee);
  }

  const request = await transaction;
  const txReceipt = await request.wait(await waitingTime());

  if (logger) {
    printReceipt(logger, txReceipt);
  }

  return txReceipt;
}

export type ContractFactoryConstructor<T extends ContractFactory> = new (
  args: any[],
) => T;
export type ContractConstructor<T extends Contract> = new (...args: any[]) => T;

async function waitForGasDeploy(logger: Logger | undefined, args: any[]) {
  if (args.length > 0 && typeof args[args.length - 1] === "object") {
    const gf = args[args.length - 1] as GasFee;
    await waitForGas(logger, gf);
  }
}

async function waitForGas(logger: Logger | undefined, fee: GasFee) {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  if (fee.maxFeePerGas) {
    const maxBaseFee = BigNumber.from(fee.maxFeePerGas).sub(
      fee.maxPriorityFeePerGas || BigNumber.from(0),
    );

    // eslint-disable-next-line no-promise-executor-return
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    while (true) {
      const blockData = await deployer.provider?.getBlock("latest");
      if (blockData?.baseFeePerGas) {
        if (blockData.baseFeePerGas.mul(1125).div(1000).gt(maxBaseFee)) {
          logger?.debug(
            `Waiting for cheaper GAS, current: ${blockData.baseFeePerGas}, target: ${maxBaseFee}`,
          );
          await delay(12000); // wait for next block - 12s
        } else {
          break;
        }
      } else {
        logger?.error("Cant get base fee from latest block");
        break;
      }
    }
  }
}

export async function deploy<T extends Contract>(
  name: string,
  logger: Logger | undefined,
  ...args: any[]
): Promise<T> {
  const artifact = await ethers.getContractFactory(name);

  await waitForGasDeploy(logger, args);

  const contract = (await artifact.deploy(...args)) as T;
  logger?.debug(`Deploying ${name}...`);
  await contract.deployed();
  const txReceipt = await contract.deployTransaction.wait(await waitingTime());

  if (logger) {
    logger.debug(`Deployed ${name} to ${contract.address}`);
    printReceipt(logger, txReceipt);
  }

  return contract;
}

export interface DeployOptions {
  logger?: Logger;
  verifier?: Verifier;
}

export async function deployWithOptions<T extends Contract>(
  name: string,
  options: DeployOptions | undefined,
  ...args: any[]
): Promise<T> {
  const contract = await deploy<T>(name, options?.logger, ...args);

  if (options?.verifier) {
    options.verifier.addContract({
      address: contract.address,
      constructorArguments: args,
    });
  }

  return contract;
}
