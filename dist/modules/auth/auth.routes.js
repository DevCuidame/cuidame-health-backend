"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../auth/auth.controller");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const auth_dto_1 = require("../auth/auth.dto");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', (0, validator_middleware_1.validateDto)(auth_dto_1.LoginDto), authController.login);
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', (0, validator_middleware_1.validateDto)(auth_dto_1.RegisterDto), authController.register);
/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token using a refresh token
 * @access Public
 */
router.post('/refresh-token', authController.refreshToken);
/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', (0, validator_middleware_1.validateDto)(auth_dto_1.ForgotPasswordDto), authController.forgotPassword);
/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', (0, validator_middleware_1.validateDto)(auth_dto_1.ResetPasswordDto), authController.resetPassword);
/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify email with token
 * @access Public
 */
router.get('/verify-email/:token', authController.verifyEmail);
/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', auth_middleware_1.authMiddleware, authController.logout);
exports.default = router;
