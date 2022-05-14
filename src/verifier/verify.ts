import { Verifier } from "./verifierDeployer";

const verifier = new Verifier();

verifier
  .deploy()
  .then(() => console.log("Ok"))
  .catch(e => console.log(e));
