"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/chat/chat.routes.ts
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
router.get('/test', chatController.test);
// Public routes
router.post('/session', chatController.startSession);
router.get('/session/:sessionId', chatController.getSession);
router.post('/message', chatController.sendMessage);
exports.default = router;
