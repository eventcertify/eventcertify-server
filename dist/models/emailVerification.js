"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailVerificationSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: [true, "please enter your email"],
        lowercase: true,
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value);
            },
            message: "please enter a valid email",
        },
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30m'
    }
});
const emailVerificationModel = mongoose_1.default.model("EmailVerification", emailVerificationSchema);
exports.default = emailVerificationModel;
//# sourceMappingURL=emailVerification.js.map