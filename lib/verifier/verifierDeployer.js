"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verifier = void 0;
/*
 * Copyright (c) 2021. Gearbox
 */
var loggedDeployer_1 = require("../logger/loggedDeployer");
var fs = __importStar(require("fs"));
var dotenv_1 = require("dotenv");
var axios_1 = __importDefault(require("axios"));
var path_1 = __importDefault(require("path"));
var hardhat_1 = __importDefault(require("hardhat"));
// Read .env to get ETHERSCAN_API KEY
(0, dotenv_1.config)({ path: ".env" });
var Verifier = /** @class */ (function (_super) {
    __extends(Verifier, _super);
    function Verifier() {
        var _this = _super.call(this) || this;
        _this.verifier = [];
        _this._networkName = hardhat_1.default.network.name;
        _this._knownNetwork =
            _this._networkName === "mainnet" || _this._networkName === "kovan";
        _this._apiKey = process.env.ETHERSCAN_API_KEY || "";
        if (_this._apiKey === "")
            throw new Error("No etherscan API provided");
        _this._fileName = path_1.default.join(process.cwd(), "./.verifier.".concat(_this._networkName, ".json"));
        return _this;
    }
    Verifier.prototype.addContract = function (c) {
        if (this._knownNetwork) {
            this._loadVerifierJson(true);
            // Add logic to check if address is already exists
            // Overwriting info for now
            this.verifier = this.verifier.filter(function (request) { return request.address.toLowerCase() !== c.address.toLowerCase(); });
            this.verifier.push(c);
            this._saveVerifier();
        }
        else {
            this._logger.debug("Skipping verification for unknown ".concat(this._networkName, " network"));
        }
    };
    Verifier.prototype.deploy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var next, isVerified;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.enableLogs();
                        if (!this._knownNetwork) {
                            throw new Error("".concat(this._networkName, " doesn't supported"));
                        }
                        this._loadVerifierJson(false);
                        next = undefined;
                        _a.label = 1;
                    case 1:
                        next = this.verifier.shift();
                        if (!next) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.isVerified(next.address)];
                    case 2:
                        isVerified = _a.sent();
                        if (!isVerified) return [3 /*break*/, 3];
                        this._logger.debug("".concat(next === null || next === void 0 ? void 0 : next.address, " is already verified"));
                        return [3 /*break*/, 5];
                    case 3:
                        this._logger.info("Verifing: ".concat(next === null || next === void 0 ? void 0 : next.address));
                        return [4 /*yield*/, hardhat_1.default.run("verify:verify", next)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        this._saveVerifier();
                        _a.label = 6;
                    case 6:
                        if (next) return [3 /*break*/, 1];
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Verifier.prototype._loadVerifierJson = function (allowEmpty) {
        if (!fs.existsSync(this._fileName)) {
            if (allowEmpty) {
                this._logger.warn("Cant find ".concat(this._fileName, ", started from scratch"));
            }
            else {
                this._logger.error("File ".concat(this._fileName, " not found"));
                process.exit(1);
            }
        }
        else {
            try {
                var file = fs.readFileSync(this._fileName);
                var parsedJSON = JSON.parse(file.toString());
                if (Array.isArray(parsedJSON)) {
                    this.verifier = parsedJSON;
                }
                else {
                    throw new Error("Incorrect json format");
                }
            }
            catch (e) {
                this._logger.error("File error: ".concat(e));
                process.exit(2);
            }
        }
    };
    Verifier.prototype.isVerified = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var url, isVerified;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this._baseUrl(this._networkName), "/api?module=contract&action=getabi&address=").concat(address, "&apikey=").concat(this._apiKey);
                        return [4 /*yield*/, axios_1.default.get(url)];
                    case 1:
                        isVerified = _a.sent();
                        return [2 /*return*/, isVerified.data && isVerified.data.status === "1"];
                }
            });
        });
    };
    Verifier.prototype._baseUrl = function (networkName) {
        switch (networkName) {
            case "mainnet":
                return "https://api.etherscan.io";
            case "kovan":
                return "https://api-kovan.etherscan.io";
            default:
                throw new Error("".concat(networkName, " is not supported"));
        }
    };
    Verifier.prototype._saveVerifier = function () {
        if (this.verifier && this.verifier.length > 0) {
            fs.writeFileSync(this._fileName, JSON.stringify(this.verifier));
            this._logger.debug("Deploy progress was saved into .verifier.json");
        }
        else {
            fs.unlinkSync(this._fileName);
            this._logger.warn("All tasks were done, ".concat(this._fileName, " was removed"));
        }
    };
    return Verifier;
}(loggedDeployer_1.LoggedDeployer));
exports.Verifier = Verifier;
