/*
 * Copyright (c) 2021. Gearbox
 */
import axios from "axios";
import * as fs from "fs";
import hre from "hardhat";
import path from "path";

import { LoggedDeployer } from "../logger/loggedDeployer";

export interface VerifyRequest {
  address: string;
  constructorArguments: Array<any>;
}

export interface EtherscanSource {
  sources: Record<
    string,
    {
      content: string;
    }
  >;
}

export class Verifier extends LoggedDeployer {
  protected verifier: Array<VerifyRequest> = [];

  protected readonly _apiKey: string;
  protected readonly _networkName: string;
  protected readonly _knownNetwork: boolean;
  protected readonly _fileName: string;

  public constructor() {
    super();
    // this is the name of the network in hardhat.config.ts, so "testnet" won't work
    this._networkName = "mainnet"; // hre.network.name;

    this._knownNetwork = ["mainnet", "goerli"].includes(this._networkName);

    this._apiKey = process.env.ETHERSCAN_API_KEY || "";
    if (this._apiKey === "") {
      throw new Error("No etherscan API provided");
    }

    this._fileName = path.join(
      process.cwd(),
      `./.verifier.${this._networkName}.json`,
    );
  }

  /**
   * Adds contract to the list of contracts that need to be verified
   * Saves updated list into temporary file
   * @param c
   */
  public addContract(c: VerifyRequest) {
    if (this._knownNetwork) {
      this._loadVerifierJson(true);

      // Add logic to check if address is already exists
      // Overwriting info for now
      this.verifier = this.verifier.filter(
        request => request.address.toLowerCase() !== c.address.toLowerCase(),
      );

      this.verifier.push(c);

      this._saveVerifier();
    } else {
      this._logger.debug(
        `Skipping verification for unknown ${this._networkName} network`,
      );
    }
  }

  /**
   * Verifies all the contract in json file with contracts list
   * Removed contracts from the list as they get verified and saves intermediate progress
   */
  public async verify() {
    this.enableLogs();

    if (!this._knownNetwork) {
      throw new Error(`${this._networkName} isn't supported`);
    }

    this._loadVerifierJson(false);

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.verifier.length; i++) {
      const next = this.verifier.shift();
      if (!next) break;
      try {
        await this.verifyOne(next);
      } catch (e) {
        this._logger.warn(`Failed to verify ${next.address}: ${e}`);
        this.verifier.push(next);
      }
      this._saveVerifier();
    }
  }

  public async compareWithGithub(address: string) {
    this.enableLogs();
    this._logger.debug(`Checking contracts fro ${address}`);
    const url = `${this._baseUrl(
      this._networkName,
    )}/api?module=contract&action=getsourcecode&address=${address}&apikey=${
      this._apiKey
    }`;
    const source = await axios.get(url);
    if (!source.data.result || source.data.status !== "1") {
      console.error(source);
      throw new Error("Cant get source from etherscan");
    }

    const etherscanResponse = (source.data.result as Array<any>).map(
      c => c.SourceCode,
    );

    const etherscanData: EtherscanSource = JSON.parse(
      etherscanResponse[0].substr(1, etherscanResponse[0].length - 2),
    );

    for (let [entry, data] of Object.entries(etherscanData.sources)) {
      if (entry.startsWith("@gearbox-protocol")) {
        const githubName = entry
          .replace(
            "@gearbox-protocol",
            "https://raw.githubusercontent.com/Gearbox-protocol",
          )
          .replace("core-v2/", "core-v2/main/")
          .replace("integrations-v2/", "integrations-v2/main/");

        const githubSource = await this.getGithubSource(githubName);

        if (data.content.trim() !== githubSource.trim()) {
          this._logger.error(`Contract ${entry} is not identical!`);
          this._logger.info(`Etherscan version:\n${data.content}`);
          this._logger.info(`Github version:\n${githubSource}`);
        } else {
          this._logger.debug(`Contract ${entry} is identical with main branch`);
        }
      } else {
        this._logger.warn(`Contract ${entry} is skipped from checking`);
      }
    }
  }

  protected async getGithubSource(url: string): Promise<string> {
    try {
      const githubSource = await axios.get(url);
      return githubSource.data;
    } catch (e) {
      throw new Error(`cant get github file, ${e}`);
    }
  }

  protected async verifyOne(req: VerifyRequest): Promise<void> {
    const isVerified = await this.isVerified(req.address);

    if (isVerified) {
      this._logger.debug(`${req?.address} is already verified`);
    } else {
      this._logger.info(`Verifying: ${req?.address}`);
      await hre.run("verify:verify", req);
      this._logger.debug("ok");
    }
  }

  protected _loadVerifierJson(allowEmpty: boolean) {
    if (!fs.existsSync(this._fileName)) {
      if (allowEmpty) {
        this._logger.warn(`Cant find ${this._fileName}, started from scratch`);
      } else {
        this._logger.error(`File ${this._fileName} not found`);
        process.exit(1);
      }
    } else {
      try {
        const file = fs.readFileSync(this._fileName);
        const parsedJSON = JSON.parse(file.toString());
        if (Array.isArray(parsedJSON)) {
          this.verifier = parsedJSON;
        } else {
          throw new Error("Incorrect json format");
        }
      } catch (e) {
        this._logger.error(`File error: ${e}`);
        process.exit(2);
      }
    }
  }

  protected async isVerified(address: string): Promise<boolean> {
    const url = `${this._baseUrl(
      this._networkName,
    )}/api?module=contract&action=getabi&address=${address}&apikey=${
      this._apiKey
    }`;
    const isVerified = await axios.get(url);
    return isVerified.data && isVerified.data.status === "1";
  }

  protected _baseUrl(networkName: string): String {
    switch (networkName) {
      case "mainnet":
        return "https://api.etherscan.io";
      case "goerli":
        return "https://api-goerli.etherscan.io";
      default:
        throw new Error(`${networkName} is not supported`);
    }
  }

  protected _saveVerifier() {
    if (this.verifier && this.verifier.length > 0) {
      fs.writeFileSync(this._fileName, JSON.stringify(this.verifier, null, 2));
      this._logger.debug("Deploy progress was saved into .verifier.json");
    } else {
      fs.unlinkSync(this._fileName);
      this._logger.warn(`All tasks were done, ${this._fileName} was removed`);
    }
  }
}
