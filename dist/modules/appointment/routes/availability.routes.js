"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/availability.routes.ts
const express_1 = require("express");
const availability_controller_1 = require("../controllers/availability.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const availabilityController = new availability_controller_1.AvailabilityController();
/**
 * Rutas públicas
 */
router.get('/professional/:id', availabilityController.getProfessionalAvailability);
/**
 * Rutas protegidas (solo para administradores)
 */
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.restrictTo)('admin'));
router.post('/', availabilityController.addAvailability);
router.put('/:id', availabilityController.updateAvailability);
router.delete('/:id', availabilityController.deleteAvailability);
exports.default = router;
