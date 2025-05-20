"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const user_dto_1 = require("./user.dto");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
/**
 * Routes that require authentication
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @route GET /api/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', userController.getProfile);
/**
 * @route PUT /api/users/profile
 * @desc Update current user profile
 * @access Private
 */
router.put('/profile', (0, validator_middleware_1.validateDto)(user_dto_1.UpdateUserDto), userController.updateProfile);
/**
 * @route PUT /api/users/change-password
 * @desc Change current user password
 * @access Private
 */
router.put('/change-password', (0, validator_middleware_1.validateDto)(user_dto_1.UpdatePasswordDto), userController.changePassword);
/**
 * @route PUT /api/users/profile-image
 * @desc Update current user profile image
 * @access Private
 */
router.put('/profile-image', userController.updateProfileImage);
/**
 * Routes that require admin role
 */
router.use((0, auth_middleware_1.restrictTo)('admin'));
/**
 * @route GET /api/users
 * @desc Get all users with pagination
 * @access Private (Admin only)
 */
router.get('/', userController.getUsers);
/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (Admin only)
 */
router.get('/:id', userController.getUserById);
/**
 * @route POST /api/users/:id/roles/:roleId
 * @desc Assign role to user
 * @access Private (Admin only)
 */
router.post('/:id/roles/:roleId', userController.assignRole);
/**
 * @route DELETE /api/users/:id/roles/:roleId
 * @desc Remove role from user
 * @access Private (Admin only)
 */
router.delete('/:id/roles/:roleId', userController.removeRole);
exports.default = router;
