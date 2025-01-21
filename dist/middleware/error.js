"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const ErrorHandler_1 = __importDefault(require("../utlis/ErrorHandler"));
// Error middleware function
const ErrorMiddleware = (err, req, res, next) => {
    // Set default values for status code and message
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    // Handle Mongoose CastError
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler_1.default(message, 400);
    }
    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler_1.default(message, 400);
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = `JSON Web Token is invalid, try again`;
        err = new ErrorHandler_1.default(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = `JSON Web Token is expired, try again`;
        err = new ErrorHandler_1.default(message, 401); // Use 401 for unauthorized
    }
    // Send response with status code and message
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.ErrorMiddleware = ErrorMiddleware;
//# sourceMappingURL=error.js.map