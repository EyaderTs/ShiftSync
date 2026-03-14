import express from 'express';
// const AuthController = require('../controllers/auth-controller');
import  {AuthController}  from "../controllers/auth-controller";

const authRoutes = express.Router();
// const validator = require('../middleware/validator');
import exceptionHandler from "../infrastructure/filters/exception-handler";
// const loginWithOtpValidator = require('../validations/auth/login-with-otp-code.validator');
// const generateLoginOtpCodeValidator = require('../validations/auth/generate-login-otp-code.validator');

// authRoutes.post(
//   '/generate-login-otp',
//  [exceptionHandler(validator(generateLoginOtpCodeValidator))],
//   exceptionHandler(AuthController.generateLoginOtp)
// );
// authRoutes.get('/get-otp-users', exceptionHandler(AuthController.getOTPUsers));
// authRoutes.post(
//   '/login-with-otp',
//    exceptionHandler(validator(loginWithOtpValidator)),
//   exceptionHandler(AuthController.loginWithOtp)
// );
authRoutes.post('/login', exceptionHandler(AuthController.login));
authRoutes.get('/refresh-token', exceptionHandler(AuthController.refreshToken));
authRoutes.post('/request-password-reset', exceptionHandler(AuthController.requestPasswordReset));
authRoutes.post('/verify-password-reset-code', exceptionHandler(AuthController.verifyPasswordResetCode));
authRoutes.post('/reset-password', exceptionHandler(AuthController.resetPassword));

// authRoutes.post('/forgot-password', exceptionHandler(AuthController.forgotPassword));
// authRoutes.post('/reset-password', exceptionHandler(AuthController.resetPassword));

export default authRoutes;
