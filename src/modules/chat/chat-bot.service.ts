// src/modules/chat/services/chat-bot.service.ts
import { MessageDirection } from '../../models/chat-message.model';
import {
  ChatSession,
  ChatSessionStatus,
  ChatStepType,
} from '../../models/chat-session.model';
import { AppointmentTypeRepository } from '../../modules/appointment/repositories/appointment-type.repository';
import { HealthProfessionalRepository } from '../../modules/appointment/repositories/health-professional.repository';
import { AppointmentRequestService } from '../../modules/appointment/services/appointment-request.service';
import { AvailabilityService } from '../../modules/appointment/services/availability.service';
import { PatientRepository } from '../../modules/patient/patient.repository';
import { BadRequestError } from '../../utils/error-handler';
import logger from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { ChatSessionRepository } from './chat-session.repository';
import { ChatMessageRepository } from './chat-message.repository';
import { AppointmentStatus } from '../../models/appointment.model';
import { EmailService } from '../../modules/notification/services/email.service';
import { NotificationService } from '../../modules/notification/notification.service';
import { UserRepository } from '../../modules/user/user.repository';
import { MedicalSpecialtyService } from '../../modules/medical-specialty/medical-specialty.service';

export class ChatBotService {
  private chatSessionRepository: ChatSessionRepository;
  private chatMessageRepository: ChatMessageRepository;
  private patientRepository: PatientRepository;
  private healthProfessionalRepository: HealthProfessionalRepository;
  private appointmentTypeRepository: AppointmentTypeRepository;
  private appointmentRequestService: AppointmentRequestService;
  private availabilityService: AvailabilityService;
  private userRepository: UserRepository;
  private medicalSpecialtyService: MedicalSpecialtyService;

  constructor() {
    this.chatSessionRepository = new ChatSessionRepository();
    this.chatMessageRepository = new ChatMessageRepository();
    this.patientRepository = new PatientRepository();
    this.healthProfessionalRepository = new HealthProfessionalRepository();
    this.appointmentTypeRepository = new AppointmentTypeRepository();
    this.appointmentRequestService = new AppointmentRequestService();
    this.availabilityService = new AvailabilityService();
    this.userRepository = new UserRepository();
    this.medicalSpecialtyService = new MedicalSpecialtyService();
  }

  /**
   * Initialize a new chat session
   */
  async startNewSession(): Promise<ChatSession> {
    const sessionId = uuidv4();

    const session = await this.chatSessionRepository.create({
      session_id: sessionId,
      current_step: ChatStepType.VALIDATE_DOCUMENT,
      status: ChatSessionStatus.ACTIVE,
      chat_data: {},
      last_interaction_at: new Date(),
    });

    // Send welcome message
    await this.sendBotMessage(
      sessionId,
      '👋 !Hola, me llamo Eli! ¡Bienvenido al sistema de agendamiento de citas médicas! Por favor, ingresa tu número de documento (cédula) para continuar:'
    );

    return session;
  }

  /**
   * Get a chat session by ID, or create a new one if not found
   */
  async getOrCreateSession(sessionId?: string): Promise<ChatSession> {
    if (sessionId) {
      const existingSession = await this.chatSessionRepository.findBySessionId(
        sessionId
      );
      if (
        existingSession &&
        existingSession.status === ChatSessionStatus.ACTIVE
      ) {
        // Update last interaction time
        await this.chatSessionRepository.update(
          existingSession.id,
          { last_interaction_at: new Date() },
          'ChatSession'
        );
        return existingSession;
      }
    }

    // Create new session if none exists or is not active
    return await this.startNewSession();
  }

  /**
   * Process incoming message and progress through chat flow
   */
  async processMessage(sessionId: string, message: string): Promise<void> {
    // Get session
    const session = await this.chatSessionRepository.findBySessionId(sessionId);
    if (!session || session.status !== ChatSessionStatus.ACTIVE) {
      throw new BadRequestError('Sesión no válida o inactiva');
    }

    // Record incoming message
    await this.chatMessageRepository.create({
      session_id: sessionId,
      direction: MessageDirection.INCOMING,
      message_content: message,
    });

    // Update last interaction time
    await this.chatSessionRepository.update(
      session.id,
      { last_interaction_at: new Date() },
      'ChatSession'
    );

    // Process based on current step
    try {
      switch (session.current_step) {
        case ChatStepType.VALIDATE_DOCUMENT:
          await this.processDocumentValidation(session, message);
          break;
        case ChatStepType.SELECT_CITY:
          await this.processCitySelection(session, message);
          break;
        case ChatStepType.SELECT_SPECIALTY:
          await this.processSpecialtySelection(session, message);
          break;
        case ChatStepType.SELECT_APPOINTMENT_TYPE:
          await this.processAppointmentTypeSelection(session, message);
          break;
        // case ChatStepType.SELECT_PROFESSIONAL:
        //   await this.processProfessionalSelection(session, message);
        //   break;
        // case ChatStepType.SELECT_DATE:
        //   await this.processDateSelection(session, message);
        //   break;
        // case ChatStepType.SELECT_TIME:
        //   await this.processTimeSelection(session, message);
        //   break;
        case ChatStepType.CONFIRM_APPOINTMENT:
          await this.processAppointmentConfirmation(session, message);
          break;
        default:
          await this.sendBotMessage(
            sessionId,
            'Lo siento, no sé cómo procesar esta información en esta etapa.'
          );
      }
    } catch (error) {
      logger.error(`Error processing chat message: ${error}`);
      await this.sendBotMessage(
        sessionId,
        'Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.'
      );
    }
  }

  /**
   * Process document validation step
   */
  private async processDocumentValidation(
    session: ChatSession,
    message: string
  ): Promise<void> {
    // Clean and validate document input
    const document = message.trim().replace(/\D/g, '');

    if (
      document.length < 6 ||
      document.length > 10 ||
      !/^\d+$/.test(document)
    ) {
      await this.sendBotMessage(
        session.session_id,
        'El número de documento debe tener entre 6 y 10 dígitos numéricos. Por favor, inténtalo nuevamente:'
      );
      return;
    }

    // Look up patient by document
    try {
      const patient = await this.patientRepository.findOneByOptions({
        where: { numeroid: document },
      });

      if (!patient) {
        await this.sendBotMessage(
          session.session_id,
          'No hemos encontrado un paciente registrado con ese número de documento. Por favor, verifica el número o contacta con soporte.'
        );
        return;
      }

      // Update session with patient info
      const chatData = session.chat_data || {};
      chatData.patientName = `${patient.nombre} ${patient.apellido}`;

      await this.chatSessionRepository.update(
        session.id,
        {
          patient_id: patient.id,
          document_number: document,
          chat_data: chatData,
          current_step: ChatStepType.SELECT_CITY,
        },
        'ChatSession'
      );

      // Send confirmation and move to city selection
      await this.sendBotMessage(
        session.session_id,
        `¡Hola ${patient.nombre}! Por favor, selecciona la ciudad donde deseas agendar tu cita:`
      );

      // Get available cities and send as options
      const cities = await this.getAvailableCities();
      const cityMessage = cities
        .map((city, index) => `${index + 1}. ${city}`)
        .join('\n');

      await this.sendBotMessage(session.session_id, cityMessage);
    } catch (error) {
      logger.error(`Error validating document: ${error}`);
      await this.sendBotMessage(
        session.session_id,
        'Hubo un problema al validar tu documento. Por favor, inténtalo nuevamente:'
      );
    }
  }

  /**
   * Process city selection step
   */
  private async processCitySelection(
    session: ChatSession,
    message: string
  ): Promise<void> {
    const cities = await this.getAvailableCities();
    const cleanMessage = message.trim().toLowerCase();

    // Check if user entered a number
    let selectedCity: string | null = null;
    if (/^\d+$/.test(cleanMessage)) {
      const cityIndex = parseInt(cleanMessage) - 1;
      if (cityIndex >= 0 && cityIndex < cities.length) {
        selectedCity = cities[cityIndex];
      }
    } else {
      // Try to match by name
      selectedCity =
        cities.find(
          (city) =>
            city.toLowerCase() === cleanMessage ||
            city.toLowerCase().includes(cleanMessage)
        ) || null;
    }

    if (!selectedCity) {
      // Send error and list cities again
      await this.sendBotMessage(
        session.session_id,
        'No hemos reconocido esa ciudad. Por favor, selecciona una de las siguientes opciones:'
      );

      const cityMessage = cities
        .map((city, index) => `${index + 1}. ${city}`)
        .join('\n');
      await this.sendBotMessage(session.session_id, cityMessage);
      return;
    }

    // Update session with selected city
    const chatData = session.chat_data || {};
    chatData.selectedCity = selectedCity;

    await this.chatSessionRepository.update(
      session.id,
      {
        chat_data: chatData,
        current_step: ChatStepType.SELECT_SPECIALTY,
      },
      'ChatSession'
    );

    // Send confirmation and move to specialty selection
    await this.sendBotMessage(
      session.session_id,
      `Has seleccionado ${selectedCity}. Ahora, elige la especialidad médica para tu cita:`
    );

    // Get available specialties and send as options
    const specialties = await this.getAvailableSpecialties(selectedCity);
    const specialtyMessage = specialties
      .map((specialty, index) => `${index + 1}. ${specialty}`)
      .join('\n');

    await this.sendBotMessage(session.session_id, specialtyMessage);
  }

  /**
   * Process specialty selection step
   */
  private async processSpecialtySelection(
    session: ChatSession,
    message: string
  ): Promise<void> {
    const chatData = session.chat_data || {};
    const city = chatData.selectedCity;

    if (!city) {
      // Something went wrong, go back to city selection
      await this.chatSessionRepository.update(
        session.id,
        { current_step: ChatStepType.SELECT_CITY },
        'ChatSession'
      );

      await this.sendBotMessage(
        session.session_id,
        'Hubo un problema con la selección de ciudad. Por favor, selecciona nuevamente la ciudad:'
      );

      const cities = await this.getAvailableCities();
      const cityMessage = cities
        .map((city, index) => `${index + 1}. ${city}`)
        .join('\n');
      await this.sendBotMessage(session.session_id, cityMessage);
      return;
    }

    const specialties = await this.getAvailableSpecialties(city);
    const cleanMessage = message.trim().toLowerCase();

    // Check if user entered a number
    let selectedSpecialty: string | null = null;
    if (/^\d+$/.test(cleanMessage)) {
      const specialtyIndex = parseInt(cleanMessage) - 1;
      if (specialtyIndex >= 0 && specialtyIndex < specialties.length) {
        selectedSpecialty = specialties[specialtyIndex];
      }
    } else {
      // Try to match by name
      selectedSpecialty =
        specialties.find(
          (specialty) =>
            specialty.toLowerCase() === cleanMessage ||
            specialty.toLowerCase().includes(cleanMessage)
        ) || null;
    }

    if (!selectedSpecialty) {
      // Send error and list specialties again
      await this.sendBotMessage(
        session.session_id,
        'No hemos reconocido esa especialidad. Por favor, selecciona una de las siguientes opciones:'
      );

      const specialtyMessage = specialties
        .map((specialty, index) => `${index + 1}. ${specialty}`)
        .join('\n');
      await this.sendBotMessage(session.session_id, specialtyMessage);
      return;
    }

    // Update session with selected specialty
    chatData.selectedSpecialty = selectedSpecialty;

    // Si la especialidad es "Medicina General", preguntar por el tipo de cita
    if (selectedSpecialty.toLowerCase() === 'medicina general') {
      await this.chatSessionRepository.update(
        session.id,
        {
          chat_data: chatData,
          current_step: ChatStepType.SELECT_APPOINTMENT_TYPE,
        },
        'ChatSession'
      );

      // Enviar mensaje para seleccionar tipo de cita
      await this.sendBotMessage(
        session.session_id,
        `Has seleccionado ${selectedSpecialty}. ¿Qué tipo de cita prefieres?
  
  1. Virtual
  2. Presencial
  
  Por favor, selecciona una opción (1 o 2):`
      );
    } else {
      // Para otras especialidades, ir directamente a confirmación
      await this.chatSessionRepository.update(
        session.id,
        {
          chat_data: chatData,
          current_step: ChatStepType.CONFIRM_APPOINTMENT,
        },
        'ChatSession'
      );

      // Enviar mensaje de confirmación con los datos seleccionados
      const confirmationMessage = `Por favor, confirma los datos de tu solicitud de cita:
        
  📝 Documento: ${session.document_number}
  👤 Paciente: ${chatData.patientName}
  🏙️ Ciudad: ${chatData.selectedCity}
  👨‍⚕️ Especialidad: ${chatData.selectedSpecialty}
    
  Nota: Un operador te asignará el profesional, fecha y hora según disponibilidad.
    
  ¿Deseas confirmar esta solicitud de cita? (Responde SI para confirmar o NO para cancelar)`;

      await this.sendBotMessage(session.session_id, confirmationMessage);
    }
  }

  private async processAppointmentTypeSelection(
    session: ChatSession,
    message: string
  ): Promise<void> {
    const chatData = session.chat_data || {};
    const cleanMessage = message.trim().toLowerCase();

    // Verificar la respuesta del usuario
    let appointmentType: string | null = null;

    if (
      cleanMessage === '1' ||
      cleanMessage === 'virtual' ||
      cleanMessage === 'v'
    ) {
      appointmentType = 'Virtual';
    } else if (
      cleanMessage === '2' ||
      cleanMessage === 'presencial' ||
      cleanMessage === 'p'
    ) {
      appointmentType = 'Presencial';
    }

    if (!appointmentType) {
      // Respuesta no válida, pedir de nuevo
      await this.sendBotMessage(
        session.session_id,
        'No hemos reconocido esa opción. Por favor, selecciona el tipo de cita: 1. Virtual 2. Presencial'
      );
      return;
    }

    // Guardar el tipo de cita seleccionado
    chatData.appointmentType = appointmentType;

    await this.chatSessionRepository.update(
      session.id,
      {
        chat_data: chatData,
        current_step: ChatStepType.CONFIRM_APPOINTMENT,
      },
      'ChatSession'
    );

    // Enviar mensaje de confirmación con los datos seleccionados
    const confirmationMessage = `Por favor, confirma los datos de tu solicitud de cita:
      
  📝 Documento: ${session.document_number}
  👤 Paciente: ${chatData.patientName}
  🏙️ Ciudad: ${chatData.selectedCity}
  👨‍⚕️ Especialidad: ${chatData.selectedSpecialty}
  🏥 Tipo de cita: ${chatData.appointmentType}
    
  Nota: Un operador te asignará el profesional, fecha y hora según disponibilidad.
    
  ¿Deseas confirmar esta solicitud de cita? (Responde SI para confirmar o NO para cancelar)`;

    await this.sendBotMessage(session.session_id, confirmationMessage);
  }

  /**
   * Process professional selection step
   */
  // private async processProfessionalSelection(
  //   session: ChatSession,
  //   message: string
  // ): Promise<void> {
  //   const chatData = session.chat_data || {};
  //   const city = chatData.selectedCity;
  //   const specialty = chatData.selectedSpecialty;

  //   if (!city || !specialty) {
  //     // Something went wrong, go back to specialty selection
  //     await this.chatSessionRepository.update(
  //       session.id,
  //       { current_step: ChatStepType.SELECT_SPECIALTY },
  //       'ChatSession'
  //     );

  //     await this.sendBotMessage(
  //       session.session_id,
  //       'Hubo un problema con la selección. Por favor, selecciona nuevamente la especialidad:'
  //     );

  //     const specialties = await this.getAvailableSpecialties(city);
  //     const specialtyMessage = specialties
  //       .map((specialty, index) => `${index + 1}. ${specialty}`)
  //       .join('\n');
  //     await this.sendBotMessage(session.session_id, specialtyMessage);
  //     return;
  //   }

  //   const professionals = await this.getAvailableProfessionals(city, specialty);
  //   const cleanMessage = message.trim().toLowerCase();

  //   // Check if user entered a number
  //   let selectedProfessional: any = null;
  //   if (/^\d+$/.test(cleanMessage)) {
  //     const index = parseInt(cleanMessage) - 1;
  //     if (index >= 0 && index < professionals.length) {
  //       selectedProfessional = professionals[index];
  //     }
  //   } else {
  //     // Try to match by name
  //     selectedProfessional =
  //       professionals.find((p) =>
  //         p.name.toLowerCase().includes(cleanMessage)
  //       ) || null;
  //   }

  //   if (!selectedProfessional) {
  //     // Send error and list professionals again
  //     await this.sendBotMessage(
  //       session.session_id,
  //       'No hemos reconocido ese profesional. Por favor, selecciona uno de los siguientes:'
  //     );

  //     const professionalMessage = professionals
  //       .map(
  //         (professional, index) =>
  //           `${index + 1}. ${professional.name} (${professional.specialty})`
  //       )
  //       .join('\n');

  //     await this.sendBotMessage(session.session_id, professionalMessage);
  //     return;
  //   }

  //   // Update session with selected professional
  //   chatData.selectedProfessional = selectedProfessional;

  //   await this.chatSessionRepository.update(
  //     session.id,
  //     {
  //       chat_data: chatData,
  //       current_step: ChatStepType.SELECT_DATE,
  //     },
  //     'ChatSession'
  //   );

  //   // Send confirmation and move to date selection
  //   await this.sendBotMessage(
  //     session.session_id,
  //     `Has seleccionado al profesional: ${selectedProfessional.name}. Ahora, selecciona la fecha para tu cita:`
  //   );

  //   // Get available dates and send as options
  //   const currentDate = new Date();
  //   const year = currentDate.getFullYear();
  //   const month = currentDate.getMonth() + 1;

  //   try {
  //     const availableDays = await this.availabilityService.getAvailableDays(
  //       selectedProfessional.id,
  //       year,
  //       month
  //     );

  //     if (availableDays.length === 0) {
  //       await this.sendBotMessage(
  //         session.session_id,
  //         'Lo sentimos, no hay fechas disponibles para este profesional en el mes actual.'
  //       );

  //       // Go back to professional selection
  //       await this.chatSessionRepository.update(
  //         session.id,
  //         { current_step: ChatStepType.SELECT_PROFESSIONAL },
  //         'ChatSession'
  //       );

  //       const professionalMessage = professionals
  //         .map(
  //           (professional, index) =>
  //             `${index + 1}. ${professional.name} (${professional.specialty})`
  //         )
  //         .join('\n');

  //       await this.sendBotMessage(
  //         session.session_id,
  //         'Por favor, selecciona otro profesional:\n' + professionalMessage
  //       );
  //       return;
  //     }

  //     const dateOptions = availableDays.map((day) => {
  //       const date = new Date(year, month - 1, day);
  //       return {
  //         day,
  //         formatted: date.toLocaleDateString('es-ES', {
  //           weekday: 'long',
  //           year: 'numeric',
  //           month: 'long',
  //           day: 'numeric',
  //         }),
  //       };
  //     });

  //     chatData.availableDates = dateOptions;
  //     await this.chatSessionRepository.update(
  //       session.id,
  //       { chat_data: chatData },
  //       'ChatSession'
  //     );

  //     const dateMessage = dateOptions
  //       .map((date, index) => `${index + 1}. ${date.formatted}`)
  //       .join('\n');

  //     await this.sendBotMessage(
  //       session.session_id,
  //       'Fechas disponibles:\n' +
  //         dateMessage +
  //         '\n\nPor favor, selecciona una opción (1-' +
  //         dateOptions.length +
  //         '):'
  //     );
  //   } catch (error) {
  //     logger.error(`Error getting available days: ${error}`);
  //     await this.sendBotMessage(
  //       session.session_id,
  //       'Hubo un problema al obtener las fechas disponibles. Por favor, inténtalo nuevamente más tarde.'
  //     );
  //   }
  // }

  /**
   * Process date selection step
   */
  // private async processDateSelection(
  //   session: ChatSession,
  //   message: string
  // ): Promise<void> {
  //   const chatData = session.chat_data || {};
  //   const availableDates = chatData.availableDates || [];

  //   if (!availableDates.length) {
  //     // Something went wrong, go back to professional selection
  //     await this.chatSessionRepository.update(
  //       session.id,
  //       { current_step: ChatStepType.SELECT_PROFESSIONAL },
  //       'ChatSession'
  //     );

  //     await this.sendBotMessage(
  //       session.session_id,
  //       'Hubo un problema con las fechas disponibles. Por favor, selecciona nuevamente el profesional:'
  //     );

  //     const professionals = await this.getAvailableProfessionals(
  //       chatData.selectedCity,
  //       chatData.selectedSpecialty
  //     );

  //     const professionalMessage = professionals
  //       .map(
  //         (professional, index) =>
  //           `${index + 1}. ${professional.name} (${professional.specialty})`
  //       )
  //       .join('\n');

  //     await this.sendBotMessage(session.session_id, professionalMessage);
  //     return;
  //   }

  //   const selectedProfessional = chatData.selectedProfessional;
  //   const cleanMessage = message.trim();

  //   // Check if user entered a valid option number
  //   let selectedDate: any = null;
  //   if (/^\d+$/.test(cleanMessage)) {
  //     const index = parseInt(cleanMessage) - 1;
  //     if (index >= 0 && index < availableDates.length) {
  //       selectedDate = availableDates[index];
  //     }
  //   }

  //   if (!selectedDate) {
  //     // Send error and list dates again
  //     await this.sendBotMessage(
  //       session.session_id,
  //       'No hemos reconocido esa opción. Por favor, selecciona un número de la lista:'
  //     );

  //     const dateMessage = availableDates
  //       .map((date: any, index: any) => `${index + 1}. ${date.formatted}`)
  //       .join('\n');

  //     await this.sendBotMessage(session.session_id, dateMessage);
  //     return;
  //   }

  //   // Update session with selected date
  //   chatData.selectedDate = selectedDate;

  //   // Get available time slots for this date
  //   try {
  //     const date = new Date();
  //     date.setFullYear(chatData.selectedDate.year || date.getFullYear());
  //     date.setMonth((chatData.selectedDate.month || date.getMonth() + 1) - 1);
  //     date.setDate(chatData.selectedDate.day);

  //     const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

  //     const availableSlots =
  //       await this.availabilityService.getAvailableTimeSlots(
  //         selectedProfessional.id,
  //         date
  //       );

  //     if (availableSlots.length === 0) {
  //       await this.sendBotMessage(
  //         session.session_id,
  //         'Lo sentimos, no hay horarios disponibles para la fecha seleccionada.'
  //       );

  //       // Go back to date selection
  //       const dateMessage = availableDates
  //         .map((date: any, index: any) => `${index + 1}. ${date.formatted}`)
  //         .join('\n');

  //       await this.sendBotMessage(
  //         session.session_id,
  //         'Por favor, selecciona otra fecha:\n' + dateMessage
  //       );
  //       return;
  //     }

  //     chatData.availableTimeSlots = availableSlots;

  //     await this.chatSessionRepository.update(
  //       session.id,
  //       {
  //         chat_data: chatData,
  //         current_step: ChatStepType.SELECT_TIME,
  //       },
  //       'ChatSession'
  //     );

  //     // Format time slots for display
  //     const timeMessage = availableSlots
  //       .map((slot: any, index: any) => `${index + 1}. ${slot.time}`)
  //       .join('\n');

  //     await this.sendBotMessage(
  //       session.session_id,
  //       `Has seleccionado el ${selectedDate.formatted}. Por favor, selecciona un horario disponible:\n${timeMessage}`
  //     );
  //   } catch (error) {
  //     logger.error(`Error getting available time slots: ${error}`);
  //     await this.sendBotMessage(
  //       session.session_id,
  //       'Hubo un problema al obtener los horarios disponibles. Por favor, inténtalo nuevamente más tarde.'
  //     );
  //   }
  // }

  // /**
  //  * Process time selection step
  //  */
  // private async processTimeSelection(
  //   session: ChatSession,
  //   message: string
  // ): Promise<void> {
  //   const chatData = session.chat_data || {};
  //   const availableTimeSlots = chatData.availableTimeSlots || [];

  //   if (!availableTimeSlots.length) {
  //     // Something went wrong, go back to date selection
  //     await this.chatSessionRepository.update(
  //       session.id,
  //       { current_step: ChatStepType.SELECT_DATE },
  //       'ChatSession'
  //     );

  //     await this.sendBotMessage(
  //       session.session_id,
  //       'Hubo un problema con los horarios disponibles. Por favor, selecciona nuevamente la fecha:'
  //     );

  //     const dateMessage = chatData.availableDates
  //       .map((date: any, index: any) => `${index + 1}. ${date.formatted}`)
  //       .join('\n');

  //     await this.sendBotMessage(session.session_id, dateMessage);
  //     return;
  //   }

  //   const cleanMessage = message.trim();

  //   // Check if user entered a valid option number
  //   let selectedTime: any = null;
  //   if (/^\d+$/.test(cleanMessage)) {
  //     const index = parseInt(cleanMessage) - 1;
  //     if (index >= 0 && index < availableTimeSlots.length) {
  //       selectedTime = availableTimeSlots[index];
  //     }
  //   }

  //   if (!selectedTime) {
  //     // Send error and list times again
  //     await this.sendBotMessage(
  //       session.session_id,
  //       'No hemos reconocido esa opción. Por favor, selecciona un número de la lista:'
  //     );

  //     const timeMessage = availableTimeSlots
  //       .map((slot: any, index: any) => `${index + 1}. ${slot.time}`)
  //       .join('\n');

  //     await this.sendBotMessage(session.session_id, timeMessage);
  //     return;
  //   }

  //   // Update session with selected time
  //   chatData.selectedTime = selectedTime;

  //   await this.chatSessionRepository.update(
  //     session.id,
  //     {
  //       chat_data: chatData,
  //       current_step: ChatStepType.CONFIRM_APPOINTMENT,
  //     },
  //     'ChatSession'
  //   );

  //   // Send confirmation message with all selections
  //   const confirmationMessage = `Por favor, confirma los datos de tu cita:

  // 📝 Documento: ${chatData.document_number || session.document_number}
  // 👤 Paciente: ${chatData.patientName}
  // 🏙️ Ciudad: ${chatData.selectedCity}
  // 👨‍⚕️ Especialidad: ${chatData.selectedSpecialty}
  // 🩺 Profesional: ${chatData.selectedProfessional.name}
  // 📅 Fecha: ${chatData.selectedDate.formatted}
  // 🕒 Hora: ${chatData.selectedTime.time}

  // ¿Deseas confirmar esta cita? (Responde SI para confirmar o NO para cancelar)`;

  //   await this.sendBotMessage(session.session_id, confirmationMessage);
  // }

  /**
   * Process appointment confirmation step
   */

  private async processAppointmentConfirmation(
    session: ChatSession,
    message: string
  ): Promise<void> {
    const cleanMessage = message.trim().toLowerCase();

    const UNASSIGNED_DATE = new Date();
    UNASSIGNED_DATE.setFullYear(UNASSIGNED_DATE.getFullYear() + 100);

    if (
      cleanMessage === 'si' ||
      cleanMessage === 'sí' ||
      cleanMessage === 's' ||
      cleanMessage === 'yes'
    ) {
      // Confirm appointment
      try {
        const chatData = session.chat_data || {};

        // 1. Obtener el ID del usuario asociado al paciente
        const patient = await this.patientRepository.findOneByOptions({
          where: { id: session.patient_id },
        });

        const userId = patient?.a_cargo_id;
        const user = userId ? await this.userRepository.findById(userId) : null;

        const appointmentData = {
          patient_id: session.patient_id,
          status: AppointmentStatus.REQUESTED,
          date: UNASSIGNED_DATE.toISOString().split('T')[0], // formato YYYY-MM-DD
          time: '00:00', // Medianoche como valor por defecto
          specialty: chatData.selectedSpecialty,
          city: chatData.selectedCity,
          appointment_type: chatData.appointmentType || 'No especificado', // Añadir tipo de cita
        };

        try {
          // Opción 1: Usando directamente el EmailService
          const emailService = EmailService.getInstance();

          // Preparar los datos del correo
          const emailData = {
            to: 'contacto.eli@cuidame.tech',
            subject: 'Nueva solicitud de cita registrada',
            html: `
              <h2>Nueva solicitud de cita</h2>
              <p><strong>Paciente:</strong> ${chatData.patientName}</p>
              <p><strong>Documento:</strong> ${session.document_number}</p>
              <p><strong>Ciudad:</strong> ${chatData.selectedCity}</p>
              <p><strong>Número del Titular:</strong> ${
                user?.phone || 'No disponible'
              }</p>
              <p><strong>Correo del Titular:</strong> ${
                user?.email || 'No disponible'
              }</p>
              <p><strong>Especialidad:</strong> ${
                chatData.selectedSpecialty
              }</p>
              <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString()}</p>
              <p>Esta cita requiere asignación de profesional, fecha y hora.</p>
            `,
          };

          // Enviar el correo
          const result = await emailService.sendEmail(emailData);

          if (result.success) {
            logger.info(
              `Email sent successfully for appointment ID: ${appointmentData}`
            );
          } else {
            logger.error(
              `Error sending email for appointment: ${result.error}`
            );
          }
        } catch (error) {
          logger.error(`Error al enviar notificación de la cita:`, error);
          // No lanzamos el error para que no afecte al flujo principal
        }

        // Create appointment request
        const appointment =
          await this.appointmentRequestService.requestAppointment(
            appointmentData,
            userId!
          );

        // Update session with appointment id and mark as completed
        await this.chatSessionRepository.update(
          session.id,
          {
            appointment_id: appointment.id,
            current_step: ChatStepType.COMPLETED,
            status: ChatSessionStatus.COMPLETED,
          },
          'ChatSession'
        );

        // Preparar mensaje de confirmación con o sin tipo de cita
        let appointmentTypeInfo = '';
        if (chatData.appointmentType) {
          appointmentTypeInfo = `🏥 Tipo de cita: ${chatData.appointmentType}\n`;
        }

        // Send confirmation message
        await this.sendBotMessage(
          session.session_id,
          `✅ ¡Tu solicitud de cita ha sido registrada exitosamente!
          
  Detalles de la solicitud:
  👤 Paciente: ${chatData.patientName}
  🏙️ Ciudad: ${chatData.selectedCity}
  👨‍⚕️ Especialidad: ${chatData.selectedSpecialty}
  ${appointmentTypeInfo}
  Recibirás un correo electrónico cuando un operador asigne profesional, fecha y hora para tu cita.
          
  ¿Necesitas algo más? Puedes iniciar una nueva conversación para solicitar otra cita.`
        );
      } catch (error) {
        logger.error(`Error creating appointment: ${error}`);
        await this.sendBotMessage(
          session.session_id,
          'Lo sentimos, hubo un problema al crear tu cita. Por favor, inténtalo nuevamente más tarde o contacta con soporte.'
        );
      }
    } else if (
      cleanMessage === 'no' ||
      cleanMessage === 'n' ||
      cleanMessage === 'cancel'
    ) {
      // Cancel appointment
      await this.chatSessionRepository.update(
        session.id,
        {
          current_step: ChatStepType.SELECT_CITY,
          chat_data: { ...session.chat_data, restartFlow: true },
        },
        'ChatSession'
      );

      // Send message
      await this.sendBotMessage(
        session.session_id,
        'Has cancelado la cita. ¿Deseas iniciar nuevamente el proceso? Por favor, selecciona la ciudad donde deseas agendar tu cita:'
      );

      // Get available cities and send as options
      const cities = await this.getAvailableCities();
      const cityMessage = cities
        .map((city, index) => `${index + 1}. ${city}`)
        .join('\n');

      await this.sendBotMessage(session.session_id, cityMessage);
    } else {
      // Invalid response
      await this.sendBotMessage(
        session.session_id,
        'Por favor, responde SI para confirmar la cita o NO para cancelar:'
      );
    }
  }

  /**
   * Helper methods
   */

  /**
   * Send bot message to user
   */
  private async sendBotMessage(
    sessionId: string,
    message: string
  ): Promise<void> {
    await this.chatMessageRepository.create({
      session_id: sessionId,
      direction: MessageDirection.OUTGOING,
      message_content: message,
    });
  }

  /**
   * Get available cities
   */
  private async getAvailableCities(): Promise<string[]> {
    return ['Bogotá', 'Tunja', 'Villa de Leyva', 'Duitama', 'Sogamoso'];
  }

    /**
   * Obtener especialidades disponibles para una ciudad específica
   * @param city Ciudad para filtrar
   * @returns Lista de nombres de especialidades
   */
    private async getAvailableSpecialties(city: string): Promise<string[]> {
      const allSpecialties = await this.medicalSpecialtyService.getAllSpecialtyNames();
      return allSpecialties;
    }

  /**
   * Get available professionals
   */
  private async getAvailableProfessionals(
    city: string,
    specialty: string
  ): Promise<any[]> {
    try {
      // In a real implementation, this would query the database filtering by city and specialty
      // For now, we'll create some dummy data
      const professionals = [
        {
          id: 1,
          name: 'Dr. Juan Pérez',
          specialty: 'Medicina General',
          appointmentTypeId: 1,
        },
        {
          id: 2,
          name: 'Dra. María Rodríguez',
          specialty: 'Pediatría',
          appointmentTypeId: 2,
        },
        {
          id: 3,
          name: 'Dr. Carlos Gómez',
          specialty: 'Ginecología',
          appointmentTypeId: 3,
        },
        {
          id: 4,
          name: 'Dra. Ana Martínez',
          specialty: 'Cardiología',
          appointmentTypeId: 4,
        },
        {
          id: 5,
          name: 'Dr. Luis Sánchez',
          specialty: 'Dermatología',
          appointmentTypeId: 5,
        },
      ];

      // Filter by specialty
      return professionals.filter(
        (p) => p.specialty.toLowerCase() === specialty.toLowerCase()
      );
    } catch (error) {
      logger.error(`Error getting professionals: ${error}`);
      return [];
    }
  }
}
