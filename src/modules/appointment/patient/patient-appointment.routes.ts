// src/modules/appointment/routes/patient-appointment.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { PatientAppointmentController } from './patient-appointment.controller';
const patientAppointmentController = new PatientAppointmentController();


const router = Router();
router.use(authMiddleware);

console.log("Cargando rutas de citas del paciente")

router.get('/ping', (req, res) => {
    res.json({ success: true, message: 'pong' });
  });
  

/**
 * @route GET /api/patient/appointments/upcoming
 * @desc Obtener próximas citas del paciente
 * @access Private
 */
router.get('/upcoming', patientAppointmentController.getUpcomingAppointments);

/**
 * IMPORTANTE: Agregamos un endpoint raíz que maneje la ruta base
 */
router.get('/', patientAppointmentController.getAllPatientsAppointments);


/**
 * @route GET /api/patient/appointments/all
 * @desc Obtener todas las citas del paciente
 * @access Private
 */
router.get('/all', patientAppointmentController.getAllPatientsAppointments);


/**
 * @route GET /api/patient/appointments/past
 * @desc Obtener citas pasadas del paciente
 * @access Private
 */
router.get('/past', patientAppointmentController.getPastAppointments);

/**
 * @route GET /api/patient/appointments/history
 * @desc Obtener historial completo de citas con paginación y filtros
 * @access Private
 */
router.get('/history', patientAppointmentController.getAppointmentHistory);

/**
 * @route GET /api/patient/appointments/:id
 * @desc Obtener detalles de una cita específica
 * @access Private
 */
router.get('/:id', patientAppointmentController.getAppointmentDetails);

/**
 * @route POST /api/patient/appointments/:id/cancel
 * @desc Cancelar una cita
 * @access Private
 */
router.post('/:id/cancel', patientAppointmentController.cancelAppointment);

/**
 * @route POST /api/patient/appointments/:id/reschedule
 * @desc Solicitar reprogramación de una cita
 * @access Private
 */
router.post('/:id/reschedule', patientAppointmentController.requestReschedule);

/**
 * @route POST /api/patient/appointments/:id/confirm-attendance
 * @desc Confirmar asistencia a una cita
 * @access Private
 */
router.post('/:id/confirm-attendance', patientAppointmentController.confirmAttendance);

export default router;