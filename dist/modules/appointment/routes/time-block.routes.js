"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/routes/time-block.routes.ts
const express_1 = require("express");
const time_block_controller_1 = require("../controllers/time-block.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const timeBlockController = new time_block_controller_1.TimeBlockController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * Rutas para consulta
 */
router.get('/:id', timeBlockController.getTimeBlockById);
router.get('/professional/:id', timeBlockController.getTimeBlocksByProfessional);
/**
 * Rutas para administradores
 */
router.use((0, auth_middleware_1.restrictTo)('admin'));
router.post('/', timeBlockController.createTimeBlock);
router.put('/:id', timeBlockController.updateTimeBlock);
router.delete('/:id', timeBlockController.deleteTimeBlock);
exports.default = router;
