"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const error_1 = require("./middleware/error");
const express_rate_limit_1 = require("express-rate-limit");
const user_route_1 = __importDefault(require("./routes/user.route"));
const passport_1 = __importDefault(require("passport"));
require("./config/google.strategy");
const jwt_1 = require("./utlis/jwt");
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.use((req, res, next) => {
    res.setTimeout(0); // Disable timeout
    next();
});
exports.app.set("trust proxy", true);
exports.app.enable('trust proxy');
exports.app.use((0, cookie_parser_1.default)());
// cors = cross origin resource sharing
exports.app.use((0, cors_1.default)({
    origin: ["http://localhost:3000",],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// api request limit
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
// All routes 
exports.app.use("/api/v1", user_route_1.default);
//google auth route
exports.app.get('/auth/google', passport_1.default.authenticate('google', { session: false, scope: ['profile', 'email'] }));
exports.app.get('/auth/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_HOST}/signin` }), function (req, res) {
    // Successful authentication, redirect home.
    const { user, accessToken, refreshToken } = req.user;
    res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions);
    res.redirect(`${process.env.FRONTEND_HOST}`);
});
// testing api
exports.app.get("/", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Hello Server",
    });
});
exports.app.get("/test", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});
//unknown route
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
// middleware calls
exports.app.use(limiter);
exports.app.use(error_1.ErrorMiddleware);
//# sourceMappingURL=app.js.map