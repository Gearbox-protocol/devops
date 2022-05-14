"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = exports.waitForTransaction = void 0;
// @ts-ignore
var hardhat_1 = require("hardhat");
var sdk_1 = require("@gearbox-protocol/sdk");
function waitForTransaction(transaction, logger) {
    return __awaiter(this, void 0, void 0, function () {
        var request, txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, transaction];
                case 1:
                    request = _a.sent();
                    return [4 /*yield*/, request.wait()];
                case 2:
                    txReceipt = _a.sent();
                    if (logger) {
                        logger.debug("Tx: ".concat(txReceipt.transactionHash));
                        logger.debug("Gas used: ".concat(txReceipt.gasUsed.toString(), " @ ").concat((0, sdk_1.formatBN)(txReceipt.effectiveGasPrice, 9), " gwei.  Total: ").concat((0, sdk_1.formatBN)(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice), 18), " ETH"));
                    }
                    return [2 /*return*/, txReceipt];
            }
        });
    });
}
exports.waitForTransaction = waitForTransaction;
function deploy(name, logger) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var artifact, contract, txReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hardhat_1.ethers.getContractFactory(name)];
                case 1:
                    artifact = _a.sent();
                    return [4 /*yield*/, artifact.deploy.apply(artifact, args)];
                case 2:
                    contract = (_a.sent());
                    logger === null || logger === void 0 ? void 0 : logger.debug("Deploying ".concat(name, "..."));
                    return [4 /*yield*/, contract.deployed()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, contract.deployTransaction.wait()];
                case 4:
                    txReceipt = _a.sent();
                    logger === null || logger === void 0 ? void 0 : logger.debug("Deployed ".concat(name, " to ").concat(contract.address));
                    logger === null || logger === void 0 ? void 0 : logger.debug("Tx: ".concat(txReceipt.transactionHash));
                    logger === null || logger === void 0 ? void 0 : logger.debug("Gas used: ".concat(txReceipt.gasUsed.toString(), " @ ").concat((0, sdk_1.formatBN)(txReceipt.effectiveGasPrice, 9), " gwei.  Total: ").concat((0, sdk_1.formatBN)(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice), 18), " ETH"));
                    return [2 /*return*/, contract];
            }
        });
    });
}
exports.deploy = deploy;
