"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/health-professional.routes.ts
const express_1 = require("express");
const health_professional_controller_1 = require("../controllers/health-professional.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const healthProfessionalController = new health_professional_controller_1.HealthProfessionalController();
/**
 * Rutas públicas
 */
router.get('/', healthProfessionalController.getAllProfessionals);
router.get('/:id', healthProfessionalController.getProfessionalById);
router.get('/specialty/:specialty', healthProfessionalController.findBySpecialty);
/**
 * Rutas protegidas (solo para administradores)
 */
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.restrictTo)('admin'));
router.post('/', healthProfessionalController.createProfessional);
router.put('/:id', healthProfessionalController.updateProfessional);
router.delete('/:id', healthProfessionalController.deleteProfessional);
exports.default = router;
