"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes.ts
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const patient_routes_1 = __importDefault(require("./modules/patient/patient.routes"));
const appointment_routes_1 = __importDefault(require("./modules/appointment/routes/appointment.routes"));
const appointment_type_routes_1 = __importDefault(require("./modules/appointment/routes/appointment-type.routes"));
const availability_routes_1 = __importDefault(require("./modules/appointment/routes/availability.routes"));
const time_block_routes_1 = __importDefault(require("./modules/appointment/routes/time-block.routes"));
const health_professional_routes_1 = __importDefault(require("./modules/appointment/routes/health-professional.routes"));
const admin_appointment_routes_1 = __importDefault(require("./modules/appointment/routes/admin-appointment.routes"));
const patient_appointment_routes_1 = __importDefault(require("./modules/appointment/patient/patient-appointment.routes"));
const appointment_request_routes_1 = __importDefault(require("./modules/appointment/routes/appointment-request.routes"));
const professional_stats_routes_1 = __importDefault(require("./modules/appointment/routes/professional-stats.routes"));
const export_routes_1 = __importDefault(require("./modules/appointment/routes/export.routes"));
const recurring_appointment_routes_1 = __importDefault(require("./modules/appointment/routes/recurring-appointment.routes"));
const questionnaire_routes_1 = __importDefault(require("./modules/appointment/routes/questionnaire.routes"));
const router = (0, express_1.Router)();
// Rutas de autenticación
router.use('/auth', auth_routes_1.default);
// Rutas de usuarios
router.use('/users', user_routes_1.default);
// Rutas de pacientes
router.use('/patients', patient_routes_1.default);
// Rutas de citas
router.use('/appointments', appointment_routes_1.default);
router.use('/appointment-types', appointment_type_routes_1.default);
router.use('/availability', availability_routes_1.default);
router.use('/time-blocks', time_block_routes_1.default);
router.use('/health-professionals', health_professional_routes_1.default);
router.use('/admin/appointments', admin_appointment_routes_1.default);
router.use('/patient/appointments', patient_appointment_routes_1.default);
router.use('/appointment-requests', appointment_request_routes_1.default);
router.use('/professional-stats', professional_stats_routes_1.default);
router.use('/export', export_routes_1.default);
// Nuevas rutas para citas recurrentes y cuestionarios
router.use('/recurring-appointments', recurring_appointment_routes_1.default);
router.use('/questionnaires', questionnaire_routes_1.default);
exports.default = router;
