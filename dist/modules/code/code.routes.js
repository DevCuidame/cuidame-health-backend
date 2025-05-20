"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const code_controller_1 = require("./code.controller");
const router = (0, express_1.Router)();
const controller = new code_controller_1.CodeController();
/**
 * Routes that require authentication
 */
// router.use(authMiddleware);
/**
 * @route GET /api/code/agreements
 * @desc Get all agreements
 * @access Private
 */
router.get('/agreements', controller.getAgreements);
/**
 * @route GET /api/code/authenticate
 * @desc Auth Code
 * @access Private
 */
router.post('/authenticate', controller.authenticateBand);
exports.default = router;
