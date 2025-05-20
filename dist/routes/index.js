"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = __importDefault(require("../utils/logger"));
// Import statements
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("../modules/user/user.routes"));
const patient_routes_1 = __importDefault(require("../modules/patient/patient.routes"));
const location_routes_1 = __importDefault(require("../modules/location/location.routes"));
const batch_medical_info_routes_1 = __importDefault(require("../modules/medical-info/batch-medical-info.routes"));
const sync_medical_info_routes_1 = __importDefault(require("../modules/medical-info/sync-medical-info.routes"));
const condition_routes_1 = __importDefault(require("../modules/condition/condition.routes"));
const code_routes_1 = __importDefault(require("../modules/code/code.routes"));
const vitals_routes_1 = __importDefault(require("../modules/vitals/vitals.routes"));
const contact_routes_1 = __importDefault(require("../modules/contact/contact.routes"));
const health_data_routes_1 = __importDefault(require("../modules/health/health-data.routes"));
const health_professional_routes_1 = __importDefault(require("../modules/appointment/routes/health-professional.routes"));
const appointment_type_routes_1 = __importDefault(require("../modules/appointment/routes/appointment-type.routes"));
const availability_routes_1 = __importDefault(require("../modules/appointment/routes/availability.routes"));
const appointment_routes_1 = __importDefault(require("../modules/appointment/routes/appointment.routes"));
const appointment_request_routes_1 = __importDefault(require("../modules/appointment/routes/appointment-request.routes"));
const time_block_routes_1 = __importDefault(require("../modules/appointment/routes/time-block.routes"));
const admin_appointment_routes_1 = __importDefault(require("../modules/appointment/routes/admin-appointment.routes"));
const professional_stats_routes_1 = __importDefault(require("../modules/appointment/routes/professional-stats.routes"));
const export_routes_1 = __importDefault(require("../modules/appointment/routes/export.routes"));
const patient_appointment_routes_1 = __importDefault(require("../modules/appointment/patient/patient-appointment.routes"));
// CHAT ROUTES - Con debug
console.log('🔍 Importando chatRoutes...');
const chat_routes_1 = __importDefault(require("../modules/chat/chat.routes"));
console.log('✅ chatRoutes importado:', typeof chat_routes_1.default);
const recurring_appointment_routes_1 = __importDefault(require("../modules/appointment/routes/recurring-appointment.routes"));
const questionnaire_routes_1 = __importDefault(require("../modules/appointment/routes/questionnaire.routes"));
const notification_routes_1 = require("../modules/notification/notification.routes");
const router = (0, express_1.Router)();
console.log('🔧 Configurando rutas principales...');
// Middleware de debug para ver todas las peticiones
router.use((req, res, next) => {
    logger_1.default.info(`🌐 Router received: ${req.method} ${req.path}`);
    next();
});
//Index
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/patients', patient_routes_1.default);
router.use('/locations', location_routes_1.default);
router.use('/medical-info/batch', batch_medical_info_routes_1.default);
router.use('/medical-info/sync', sync_medical_info_routes_1.default);
router.use('/medical-info/condition', condition_routes_1.default);
router.use('/health-data', health_data_routes_1.default);
router.use('/code', code_routes_1.default);
router.use('/contacts', contact_routes_1.default);
router.use('/patient/appointments', patient_appointment_routes_1.default);
// CHAT ROUTES - Con debug detallado
console.log('🔧 Registrando chatRoutes en /chat...');
console.log('   chatRoutes type:', typeof chat_routes_1.default);
console.log('   chatRoutes keys:', Object.keys(chat_routes_1.default));
try {
    router.use('/chat', chat_routes_1.default);
    console.log('✅ chatRoutes registrado correctamente en /chat');
}
catch (error) {
    console.error('❌ Error registrando chatRoutes:', error);
}
router.use('/professionals', health_professional_routes_1.default);
router.use('/appointment-types', appointment_type_routes_1.default);
router.use('/availability', availability_routes_1.default);
router.use('/appointments', appointment_routes_1.default);
router.use('/appointment-requests', appointment_request_routes_1.default);
router.use('/time-blocks', time_block_routes_1.default);
router.use('/admin/appointments', admin_appointment_routes_1.default);
router.use('/admin/professionals', professional_stats_routes_1.default);
router.use('/admin/export', export_routes_1.default);
router.use('/recurring-appointments', recurring_appointment_routes_1.default);
router.use('/questionnaires', questionnaire_routes_1.default);
// Rutas de notificación actualizadas
router.use('/notifications', notification_routes_1.notificationRoutes);
router.use('/admin/notifications', notification_routes_1.adminNotificationRoutes);
router.use('/', vitals_routes_1.default);
// Debug final: mostrar rutas registradas
router.use((req, res, next) => {
    logger_1.default.warn(`🔍 Route not matched in main router: ${req.method} ${req.path}`);
    next();
});
console.log('✅ Todas las rutas principales configuradas');
exports.default = router;
