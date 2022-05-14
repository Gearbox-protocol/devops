"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var verifierDeployer_1 = require("./verifierDeployer");
var verifier = new verifierDeployer_1.Verifier();
verifier
    .deploy()
    .then(function () { return console.log("Ok"); })
    .catch(function (e) { return console.log(e); });
