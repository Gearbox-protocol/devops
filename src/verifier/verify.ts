import { Verifier } from "./Verifier";

const verifier = new Verifier();

verifier
  .verify()
  .then(() => console.log("Ok"))
  .catch(e => console.log(e));
