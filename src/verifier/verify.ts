import { Verifier } from "./Verifier";

new Verifier()
  .verify()
  .then(() => console.log("Ok"))
  .catch(e => console.log(e));
