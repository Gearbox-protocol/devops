import { LoggedDeployer } from "../logger/loggedDeployer";
export interface VerifyRequest {
    address: string;
    constructorArguments: Array<any>;
}
export declare class Verifier extends LoggedDeployer {
    protected verifier: Array<VerifyRequest>;
    protected readonly _apiKey: string;
    protected readonly _networkName: string;
    protected readonly _knownNetwork: boolean;
    protected readonly _fileName: string;
    constructor();
    addContract(c: VerifyRequest): void;
    deploy(): Promise<void>;
    protected _loadVerifierJson(allowEmpty: boolean): void;
    protected isVerified(address: string): Promise<boolean>;
    protected _baseUrl(networkName: string): String;
    protected _saveVerifier(): void;
}
