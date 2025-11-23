"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("./config.js");
const userMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(403).json({
            message: "No token provided"
        });
    }
    // Header looks like: "Bearer tokenvalue"
    const token = header.split(" ")[1];
    if (!token) {
        return res.status(403).json({
            message: "Invalid token format"
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_js_1.JWT_PASSWORD);
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};
exports.userMiddleware = userMiddleware;
