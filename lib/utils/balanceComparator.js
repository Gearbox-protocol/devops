"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceComparator = void 0;
var sdk_1 = require("@gearbox-protocol/sdk");
var expect_1 = require("./expect");
var getNetwork_1 = require("./getNetwork");
var BalanceComparator = /** @class */ (function () {
    function BalanceComparator(list, _provider) {
        this._balanceSnapshot = {};
        this._provider = _provider;
        this._list = list;
    }
    BalanceComparator.prototype.storeBalances = function (stage, holder) {
        return __awaiter(this, void 0, void 0, function () {
            var balances, network, _i, _a, symbol, token, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        balances = {};
                        return [4 /*yield*/, this.getNetwork()];
                    case 1:
                        network = _e.sent();
                        _i = 0, _a = this._list;
                        _e.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        symbol = _a[_i];
                        token = sdk_1.IERC20__factory.connect(sdk_1.tokenDataByNetwork[network][symbol], this._provider);
                        _b = balances;
                        _c = symbol;
                        return [4 /*yield*/, token.balanceOf(holder)];
                    case 3:
                        _b[_c] = _e.sent();
                        _e.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this._balanceSnapshot[stage] = __assign(__assign({}, this._balanceSnapshot[stage]), (_d = {}, _d[holder] = balances, _d));
                        return [2 /*return*/];
                }
            });
        });
    };
    BalanceComparator.prototype.compareBalances = function (stage, holder, compareWith) {
        return __awaiter(this, void 0, void 0, function () {
            var network, _i, _a, symbol, token, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getNetwork()];
                    case 1:
                        network = _c.sent();
                        _i = 0, _a = this._list;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        symbol = _a[_i];
                        token = sdk_1.IERC20__factory.connect(sdk_1.tokenDataByNetwork[network][symbol], this._provider);
                        _b = expect_1.expect;
                        return [4 /*yield*/, token.balanceOf(compareWith)];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).to.be.eq(this.getBalance(stage, holder, symbol));
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BalanceComparator.prototype.getNetwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this._networkType) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, (0, getNetwork_1.detectNetwork)()];
                    case 1:
                        _a._networkType = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this._networkType];
                }
            });
        });
    };
    BalanceComparator.prototype.getBalance = function (stage, account, token) {
        var _a, _b;
        return (_b = (_a = this._balanceSnapshot[stage]) === null || _a === void 0 ? void 0 : _a[account]) === null || _b === void 0 ? void 0 : _b[token];
    };
    return BalanceComparator;
}());
exports.BalanceComparator = BalanceComparator;
