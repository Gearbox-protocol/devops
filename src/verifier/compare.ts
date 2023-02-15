import { Verifier } from "./Verifier";

new Verifier()
  .compareWithGithub(process.argv[2])
  .then(() => console.log("Ok"))
  .catch(e => console.log(e));
