// src/modules/appointment/websocket/appointment-socket.service.ts
import WebSocket from 'ws';
import http from 'http';
import url from 'url';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentService } from '../services/appointment.service';
import logger from '../../../utils/logger';

export class AppointmentSocketService {
  private wss: WebSocket.Server;
  private appointmentService: AppointmentService;
  private clients: Map<string, WebSocket>;

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws/appointments',
      
      perMessageDeflate: false,
      maxPayload: 1024 * 1024,
      clientTracking: true,
      verifyClient: (info, callback) => {
        const pathname = url.parse(info.req.url || '').pathname;
        const isValid = pathname === '/ws/appointments';
        logger.info(
          `Connection ${isValid ? 'approved' : 'rejected'} for ${pathname}`
        );
        callback(isValid);
      },
    });

    this.appointmentService = new AppointmentService();
    this.clients = new Map();

    this.initialize();
  }

  public getServer(): WebSocket.Server {
    return this.wss;
  }

  private initialize(): void {
    // Log cuando el servidor esté listo
    this.wss.on('listening', () => {
      logger.info(
        '📅 WebSocket appointment server is listening on /ws/appointments'
      );
    });

    // Manejar las conexiones
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);

      // Set up ping/pong
      ws.on('pong', () => {
        logger.debug(`📅 Pong from ${clientId}`);
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'connection',
          clientId,
          message: 'Conectado al servidor de appointments',
        })
      );

      // Manejar mensajes
      ws.on('message', async (message: string) => {
        try {
          let data;
          try {
            data = JSON.parse(message);
          } catch (parseError) {
            logger.error(
              `Invalid JSON received from appointment client: ${message}`
            );
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'Formato de mensaje inválido',
              })
            );
            return;
          }

          logger.info(
            `📅 Appointment message received from ${clientId}:`,
            data
          );

          switch (data.type) {
            case 'fetchAllAppointments':
              await this.handleFetchAllAppointments(clientId, ws);
              break;
            case 'subscribeToUpdates':
              await this.handleSubscribeToUpdates(clientId, ws);
              break;
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              logger.debug(`📅 Pong sent to client ${clientId}`);
              break;
            default:
              logger.warn(`Unknown appointment message type: ${data.type}`);
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Tipo de mensaje no reconocido',
                })
              );
          }
        } catch (error) {
          logger.error(
            `Error handling appointment WebSocket message from ${clientId}:`,
            error
          );
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Error interno al procesar el mensaje',
            })
          );
        }
      });

      // Manejar pong
      ws.on('pong', () => {
        logger.debug(`📅 Pong received from appointment client ${clientId}`);
      });

      // Manejar errores
      ws.on('error', (error) => {
        logger.error(`📅 WebSocket error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      ws.on('close', (code, reason) => {
        logger.info(
          `📅 Client ${clientId} disconnected. Code: ${code}, Reason: ${reason.toString()}`
        );
        this.clients.delete(clientId);
      });
    });

    this.wss.on('headers', (headers, request) => {
      logger.debug('WebSocket Headers:', headers);
    });

    // Configurar ping interval para mantener conexiones activas
    setInterval(() => {
      this.clients.forEach((ws, clientId) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, 30000);
  }

  /**
   * Manejar solicitud de todas las appointments
   */
  private async handleFetchAllAppointments(
    clientId: string,
    ws: WebSocket
  ): Promise<void> {
    try {
      logger.info(`📅 Fetching all appointments for client ${clientId}`);

      const appointments = await this.appointmentService.getAllAppointments();

      const response = {
        type: 'appointmentsList',
        appointments: appointments,
      };

      ws.send(JSON.stringify(response));

      logger.info(
        `📅 Sent ${appointments.length} appointments to client ${clientId}`
      );
    } catch (error) {
      logger.error(
        `Error fetching appointments for client ${clientId}:`,
        error
      );
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Error al obtener las appointments',
        })
      );
    }
  }

  /**
   * Manejar suscripción a actualizaciones
   */
  private async handleSubscribeToUpdates(
    clientId: string,
    ws: WebSocket
  ): Promise<void> {
    try {
      logger.info(`📅 Client ${clientId} subscribed to appointment updates`);

      ws.send(
        JSON.stringify({
          type: 'subscriptionConfirmed',
          message: 'Suscrito a actualizaciones de appointments',
        })
      );
    } catch (error) {
      logger.error(`Error subscribing client ${clientId} to updates:`, error);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Error al suscribirse a actualizaciones',
        })
      );
    }
  }

  /**
   * Notificar nueva appointment a todos los clientes conectados
   */
  public notifyNewAppointment(appointment: any): void {
    const message = JSON.stringify({
      type: 'newAppointment',
      appointment: appointment,
    });

    this.broadcast(message, 'new appointment');
  }

  /**
   * Notificar appointment actualizada a todos los clientes conectados
   */
  public notifyAppointmentUpdated(appointment: any): void {
    const message = JSON.stringify({
      type: 'appointmentUpdated',
      appointment: appointment,
    });

    this.broadcast(message, 'appointment updated');
  }

  /**
   * Notificar appointment eliminada a todos los clientes conectados
   */
  public notifyAppointmentDeleted(appointmentId: number): void {
    const message = JSON.stringify({
      type: 'appointmentDeleted',
      appointmentId: appointmentId,
    });

    this.broadcast(message, 'appointment deleted');
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: string, action: string): void {
    let sentCount = 0;
    let errorCount = 0;

    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
          sentCount++;
        } catch (error) {
          logger.error(`Error sending ${action} to client ${clientId}:`, error);
          this.clients.delete(clientId);
          errorCount++;
        }
      } else {
        this.clients.delete(clientId);
      }
    });

    logger.info(
      `📅 ${action} broadcasted to ${sentCount} clients (${errorCount} errors)`
    );
  }

  /**
   * Obtener número de clientes conectados
   */
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Cerrar todas las conexiones
   */
  public closeAllConnections(): void {
    this.clients.forEach((ws, clientId) => {
      try {
        ws.close(1000, 'Server shutdown');
      } catch (error) {
        logger.error(`Error closing connection for client ${clientId}:`, error);
      }
    });

    this.clients.clear();

    if (this.wss) {
      this.wss.close(() => {
        logger.info('📅 WebSocket appointment server closed');
      });
    }
  }

  /**
   * Obtener estadísticas del servidor
   */
  public getServerStats(): object {
    return {
      connectedClients: this.clients.size,
      serverStatus: this.wss ? 'running' : 'stopped',
      path: '/ws/appointments',
      uptime: process.uptime(),
    };
  }

  /**
   * Limpiar clientes desconectados
   */
  public cleanupDisconnectedClients(): void {
    const disconnectedClients: string[] = [];

    this.clients.forEach((ws, clientId) => {
      if (
        ws.readyState === WebSocket.CLOSED ||
        ws.readyState === WebSocket.CLOSING
      ) {
        disconnectedClients.push(clientId);
      }
    });

    disconnectedClients.forEach((clientId) => {
      this.clients.delete(clientId);
      logger.info(`🧹 Cleaned up disconnected client: ${clientId}`);
    });

    if (disconnectedClients.length > 0) {
      logger.info(
        `🧹 Cleaned up ${disconnectedClients.length} disconnected clients`
      );
    }
  }

  /**
   * Verificar salud del servidor WebSocket
   */
  public getHealthCheck(): object {
    return {
      status: this.wss ? 'healthy' : 'unhealthy',
      connectedClients: this.clients.size,
      serverReadyState: this.wss ? 'OPEN' : 'CLOSED',
      path: '/ws/appointments',
      timestamp: new Date().toISOString(),
    };
  }
}
