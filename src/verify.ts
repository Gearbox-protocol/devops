import { Verifier } from "./verifierDeployer";

const main = async () => {
    const verifier = new Verifier()
    await verifier.deploy();
}

main()