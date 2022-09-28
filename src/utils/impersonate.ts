import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";

export async function impersonate(address: string): Promise<SignerWithAddress> {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

  await network.provider.send("hardhat_setBalance", [
    address,
    "0x10000000000000000000",
  ]);

  const signer = (await ethers.provider.getSigner(
    address,
  )) as unknown as SignerWithAddress;

  return signer;
}

export async function stop_impersonate(address: string) {
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [address],
  });
}
