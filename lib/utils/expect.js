"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = void 0;
var ethereum_waffle_1 = require("ethereum-waffle");
var chai = require("chai");
chai.use(ethereum_waffle_1.solidity);
exports.expect = chai.expect;
