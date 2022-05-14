/*
 * Copyright (c) 2021. Gearbox
 */
import { LoggedDeployer } from "../logger/loggedDeployer";
import * as fs from "fs";
import { config as dotEnvConfig } from "dotenv";
import axios from "axios";
import path from "path";
import hre from "hardhat";

// Read .env to get ETHERSCAN_API KEY
dotEnvConfig({ path: ".env" });

export interface VerifyRequest {
  address: string;
  constructorArguments: Array<any>;
}

export class Verifier extends LoggedDeployer {
  protected verifier: Array<VerifyRequest> = [];

  protected readonly _apiKey: string;
  protected readonly _networkName: string;
  protected readonly _knownNetwork: boolean;
  protected readonly _fileName: string;

  constructor() {
    super();
    this._networkName = hre.network.name;

    this._knownNetwork =
      this._networkName === "mainnet" || this._networkName === "kovan";

    this._apiKey = process.env.ETHERSCAN_API_KEY || "";
    if (this._apiKey === "") throw new Error("No etherscan API provided");

    this._fileName = path.join(
      process.cwd(),
      `./.verifier.${this._networkName}.json`
    );
  }

  addContract(c: VerifyRequest) {
    if (this._knownNetwork) {
      this._loadVerifierJson(true);

      // Add logic to check if address is already exists
      // Overwriting info for now
      this.verifier = this.verifier.filter(
        request => request.address.toLowerCase() !== c.address.toLowerCase()
      );

      this.verifier.push(c);

      this._saveVerifier();
    } else {
      this._logger.debug(
        `Skipping verification for unknown ${this._networkName} network`
      );
    }
  }

  async deploy() {
    this.enableLogs();

    if (!this._knownNetwork) {
      throw new Error(`${this._networkName} doesn't supported`);
    }

    this._loadVerifierJson(false);

    let next: VerifyRequest | undefined = undefined;

    do {
      next = this.verifier.shift();

      if (next) {
        const isVerified = await this.isVerified(next.address);

        if (isVerified) {
          this._logger.debug(`${next?.address} is already verified`);
        } else {
          this._logger.info(`Verifing: ${next?.address}`);
          await hre.run("verify:verify", next);
        }
      }

      this._saveVerifier();
    } while (next);
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
      this._networkName
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
      case "kovan":
        return "https://api-kovan.etherscan.io";
      default:
        throw new Error(`${networkName} is not supported`);
    }
  }

  protected _saveVerifier() {
    if (this.verifier && this.verifier.length > 0) {
      fs.writeFileSync(this._fileName, JSON.stringify(this.verifier));
      this._logger.debug("Deploy progress was saved into .verifier.json");
    } else {
      fs.unlinkSync(this._fileName);
      this._logger.warn(`All tasks were done, ${this._fileName} was removed`);
    }
  }
}
