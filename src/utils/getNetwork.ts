// @ts-ignore
import { ethers } from "hardhat";
// @ts-ignore
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/root-with-address";
import {
  ADDRESS_0X0,
  IERC20__factory,
  NetworkType,
  tokenDataByNetwork
} from "@gearbox-protocol/sdk";

export async function detectNetwork(): Promise<NetworkType> {
  const accounts = (await ethers.getSigners()) as Array<SignerWithAddress>;
  const deployer = accounts[0];

  try {
    const usdcMainnet = IERC20__factory.connect(
      tokenDataByNetwork.Mainnet.USDC,
      deployer
    );
    await usdcMainnet.balanceOf(ADDRESS_0X0);
    return "Mainnet";
  } catch {
    try {
      const usdcMainnet = IERC20__factory.connect(
        tokenDataByNetwork.Goerli.USDC,
        deployer
      );
      await usdcMainnet.balanceOf(ADDRESS_0X0);
      return "Goerli";
    } catch {
      throw new Error("Unknown network");
    }
  }
}
