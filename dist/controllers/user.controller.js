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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadManyUser = exports.resetPassword = exports.sendPasswordResetEmail = exports.updatePassword = exports.updateUserInfo = exports.getUserInfo = exports.updateAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.registrationUser = void 0;
const jwt_1 = require("./../utlis/jwt");
require("dotenv").config();
const ErrorHandler_1 = __importDefault(require("../utlis/ErrorHandler"));
const CatchAsyncError_1 = require("../middleware/CatchAsyncError");
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utlis/sendMail"));
const redis_1 = require("../utlis/redis");
const user_service_1 = require("../services/user.service");
const emailVerification_1 = __importDefault(require("../models/emailVerification"));
exports.registrationUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const isEmailExist = yield user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler_1.default("Email already exist", 400));
        }
        const user = {
            name,
            email,
            password,
        };
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const data = { user: { name: user.name }, activationCode };
        // Check if the email already exists in the database
        let emailVerification = yield emailVerification_1.default.findOne({ email });
        if (emailVerification) {
            // Update the existing document
            emailVerification.otp = activationCode;
            yield emailVerification.save();
            console.log("Email updated");
        }
        else {
            // Create a new document
            yield new emailVerification_1.default({
                email,
                otp: activationCode,
            }).save();
            console.log("new Email added");
        }
        const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verification</title>
          <style>
              /* Reset CSS */
              body, html {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #f9f9f9;
                  color: #333;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 30px;
                  background-color: #ffffff;
                  border-radius: 20px;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #007bff;
                  text-align: center;
                  margin-top: 0;
                  font-size: 28px;
                  margin-bottom: 20px;
              }
              h2 {
                  color: #444;
                  text-align: center;
                  font-size: 20px;
                  margin-top: 0;
                  margin-bottom: 20px;
              }
              p {
                  color: #444;
                  font-size: 16px;
                  line-height: 1.6;
                  margin-bottom: 20px;
                  text-align: center;
              }
              .activation-code {
                  background-color: #f0f0f0;
                  padding: 20px;
                  text-align: center;
                  border-radius: 10px;
                  margin-bottom: 30px;
                  font-size: 20px;
              }
              .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #777;
                  margin-top: 20px;
              }
              .logo {
                  display: block;
                  margin: 0 auto;
                  max-width: 80px;
                  margin-bottom: 20px;
              }
      
              /* Media Query for smaller screens */
              @media only screen and (max-width: 600px) {
                  h1 {
                      font-size: 24px;
                  }
                  h2 {
                      font-size: 18px;
                  }
                  p {
                      font-size: 14px;
                  }
                  .activation-code {
                      font-size: 16px;
                  }
                  .footer {
                      font-size: 12px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <!-- <img src="https://res.cloudinary.com/dd1rpkqom/image/upload/v1713812782/Logo/htufx0pzpqdah3v1mkqw.png" alt="HIT" class="logo"> -->
              
              <p>Hello ${data.user.name},</p>
              
              <div class="activation-code">
                  <strong>${data.activationCode}</strong>
              </div>
              <p>Enter this OTP code to verify your email and activate your account.</p>
              <p>If you haven't requested this OTP, please ignore this email. Your security is important to us.</p>
          </div>
      </body>
      </html>
      `;
        try {
            yield (0, sendMail_1.default)({
                email: user.email,
                subject: "Activate your account",
                template: html
            });
            res.status(201).json({
                success: true,
                message: `Please check your email : ${user.email} to activate your account`,
                user,
            });
        }
        catch (error) {
            console.log(error);
            return next(new ErrorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    return { activationCode };
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activation_code, email, name, password } = req.body;
        const newUser = yield emailVerification_1.default.findOne({
            email,
        });
        if (!newUser) {
            return next(new ErrorHandler_1.default("Invalid user or activation code expired", 400));
        }
        if ((newUser === null || newUser === void 0 ? void 0 : newUser.otp) !== activation_code) {
            return next(new ErrorHandler_1.default("Invalid activation code", 400));
        }
        const existUser = yield user_model_1.default.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler_1.default("Email already Exist", 400));
        }
        const user = yield user_model_1.default.create({
            name,
            email,
            password,
        });
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.loginUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler_1.default("Please enter the email and password", 400));
    }
    const user = yield user_model_1.default.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler_1.default("Please enter valid email and password", 400));
    }
    const isPasswordMatched = yield user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler_1.default("Please enter valid email and password", 400));
    }
    user.password = "";
    (0, jwt_1.sendToken)(user, 200, res);
}));
// user logout
exports.logoutUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear cookies
        res.cookie("access_token", "", {
            maxAge: 1,
            httpOnly: false,
            sameSite: "none",
            secure: true,
            domain: "dsch.site",
        });
        res.cookie("refresh_token", "", {
            maxAge: 1,
            httpOnly: false,
            sameSite: "none",
            secure: true,
            domain: "dsch.site",
        });
        // Delete user session from Redis
        const userId = req.user._id || "";
        if (userId) {
            redis_1.redis.del(userId);
        }
        // Send response
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
// update access token
exports.updateAccessToken = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh_token = req.cookies.refresh_token;
        // console.log("call2")
        const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
        const message = "Could not refresh token";
        if (!decoded) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        const session = yield redis_1.redis.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        const user = JSON.parse(session);
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN, { expiresIn: "5m" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: "3d" });
        req.user = user;
        res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions);
        res.status(200).json({
            status: "success",
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
// get user info
exports.getUserInfo = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id || "";
        (0, user_service_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.updateUserInfo = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, department, classRollNo, whatsappNo } = req.body;
        const userId = req.user._id;
        // Find the user by ID
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return next(new ErrorHandler_1.default("Invalid User", 400));
        }
        // Update user details only if new values are provided
        if (name) {
            user.name = name;
        }
        if (department) {
            user.department = department;
        }
        if (classRollNo) {
            user.classRollNo = classRollNo;
        }
        if (whatsappNo) {
            user.whatsappNo = whatsappNo;
        }
        // Save updated user info
        yield user.save();
        // Update user information in Redis
        yield redis_1.redis.set(userId, JSON.stringify(user));
        // Return the updated user information in response
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.updatePassword = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldpassword, newpassword } = req.body;
        // Validate input
        if (!oldpassword || !newpassword) {
            return next(new ErrorHandler_1.default("Please enter both the old and new passwords", 400));
        }
        // Validate new password strength
        if (newpassword.length < 8) {
            return next(new ErrorHandler_1.default("New password must be at least 8 characters long", 400));
        }
        const user = yield user_model_1.default
            .findById(req.user._id)
            .select("+password");
        if (!user || !user.password) {
            return next(new ErrorHandler_1.default("Invalid user", 400));
        }
        // Check if old password matches
        const isPasswordMatched = yield user.comparePassword(oldpassword);
        if (!isPasswordMatched) {
            return next(new ErrorHandler_1.default("Invalid old password", 400));
        }
        // Update password
        user.password = newpassword;
        yield user.save();
        // Update user session in Redis
        try {
            yield redis_1.redis.set(req.user._id, JSON.stringify(user));
        }
        catch (redisError) {
            return next(new ErrorHandler_1.default("Error updating user session in Redis", 500));
        }
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default("An error occurred while updating the password", 500));
    }
}));
// Send Password Reset Email
exports.sendPasswordResetEmail = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Validate input
        if (!email) {
            return next(new ErrorHandler_1.default("Please enter your email address.", 400));
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return next(new ErrorHandler_1.default("No account found with that email address.", 400));
        }
        const secret = user._id + process.env.ACCESS_TOKEN;
        const token = jsonwebtoken_1.default.sign({ userID: user._id }, secret, {
            expiresIn: "15m",
        });
        // Store reset token and expiration in database
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        yield user.save();
        // Generate reset link
        const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;
        console.log(resetLink); // Log the reset link for debugging
        const data = { user: { name: user.name }, resetLink };
        // Render the email template
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/Reset-password-mail.ejs"), data);
        try {
            yield (0, sendMail_1.default)({
                email: user.email,
                subject: "Reset Your Password",
                template: "Reset-password-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `A password reset link has been sent to ${user.email}. Please check your email.`,
            });
        }
        catch (error) {
            console.error("Error sending email:", error);
            return next(new ErrorHandler_1.default("Failed to send reset email. Please try again later.", 500));
        }
    }
    catch (error) {
        console.error("Error in password reset process:", error);
        return next(new ErrorHandler_1.default("An unexpected error occurred while processing your request. Please try again later.", 500));
    }
}));
exports.resetPassword = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, confirmPassword } = req.body;
        const { id, token } = req.params;
        // Validate input
        if (!id || !token) {
            return next(new ErrorHandler_1.default("Invalid request. Missing user ID or token.", 400));
        }
        // Validate new passwords
        if (!password || !confirmPassword) {
            return next(new ErrorHandler_1.default("Please enter both the new password and confirmation password.", 400));
        }
        if (password !== confirmPassword) {
            return next(new ErrorHandler_1.default("The passwords do not match. Please try again.", 400));
        }
        // Validate new password strength
        if (password.length < 8) {
            return next(new ErrorHandler_1.default("The new password must be at least 8 characters long.", 400));
        }
        // Find user by ID and check reset token
        const user = yield user_model_1.default.findById(id);
        if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
            return next(new ErrorHandler_1.default("Invalid or expired reset token.", 400));
        }
        // Check if the reset token is valid and not expired
        const secret = user._id + process.env.ACCESS_TOKEN;
        try {
            jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            return next(new ErrorHandler_1.default("Invalid or expired reset token.", 400));
        }
        if (user.resetPasswordExpires < new Date()) {
            return next(new ErrorHandler_1.default("Reset token has expired. Please request a new password reset link.", 400));
        }
        if (user.resetPasswordToken !== token) {
            return next(new ErrorHandler_1.default("Invalid reset token. Please request a new password reset link.", 400));
        }
        // Update the user's password
        user.password = password;
        user.resetPasswordToken = undefined; // Mark the token as used
        user.resetPasswordExpires = undefined; // Clear the expiration date
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Your password has been successfully reset.",
        });
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new ErrorHandler_1.default("The reset link has expired. Please request a new password reset link.", 400));
        }
        else if (error.name === "JsonWebTokenError") {
            return next(new ErrorHandler_1.default("The reset link is invalid. Please request a new password reset link.", 400));
        }
        else {
            return next(new ErrorHandler_1.default("An unexpected error occurred while updating your password. Please try again later.", 500));
        }
    }
}));
//temporary --------------------- >
exports.uploadManyUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = [{}];
        const users = yield Promise.all(data.map((userData) => user_model_1.default.create(userData)));
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//# sourceMappingURL=user.controller.js.map