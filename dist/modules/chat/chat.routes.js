"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/chat/chat.routes.ts
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
router.use(auth_middleware_1.authMiddleware);
// Public routes
router.post('/session', chatController.startSession);
router.get('/session/:sessionId', chatController.getSession);
router.post('/message', chatController.sendMessage);
// Protected routes (if needed)
// Add protected routes here
exports.default = router;
