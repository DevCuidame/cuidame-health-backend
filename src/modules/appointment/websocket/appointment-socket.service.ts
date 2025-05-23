// src/modules/appointment/websocket/appointment-socket.service.ts
import WebSocket from 'ws';
import http from 'http';
import url from 'url';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentService } from '../services/appointment.service';
import logger from '../../../utils/logger';

interface ClientInfo {
  ws: WebSocket;
  clientId: string;
  connectedAt: Date;
  lastPing: Date;
  isAlive: boolean;
}

export class AppointmentSocketService {
  private wss: WebSocket.Server;
  private appointmentService: AppointmentService;
  private clients: Map<string, ClientInfo>;
  private pingInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(server: http.Server) {
    // Configuración específica para WebSocket de appointments
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/appointments',
      perMessageDeflate: false,
      maxPayload: 1024 * 1024, // 1MB
      clientTracking: true,
      verifyClient: (info: any) => {
        const pathname = url.parse(info.req.url || '').pathname;
        logger.info(`🔍 WebSocket appointment connection attempt to: ${pathname}`);
        
        if (pathname === '/ws/appointments') {
          logger.info(`✅ WebSocket appointment connection verified`);
          return true;
        }
        
        logger.warn(`❌ WebSocket appointment connection rejected for: ${pathname}`);
        return false;
      }
    });
    
    this.appointmentService = new AppointmentService();
    this.clients = new Map();
    
    this.initialize();
  }

  private initialize(): void {
    // Log cuando el servidor esté listo
    this.wss.on('listening', () => {
      logger.info('📅 WebSocket appointment server is listening on /ws/appointments');
    });

    // Manejar las conexiones
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      const clientInfo: ClientInfo = {
        ws,
        clientId,
        connectedAt: new Date(),
        lastPing: new Date(),
        isAlive: true
      };
      
      this.clients.set(clientId, clientInfo);
      
      logger.info(`📅 WebSocket appointment client connected: ${clientId} from ${request.socket.remoteAddress || 'unknown'}`);
      logger.info(`📅 Total connected clients: ${this.clients.size}`);
      
      // Enviar mensaje de bienvenida
      this.sendToClient(clientId, {
        type: 'connection',
        clientId,
        message: 'Conectado al servidor de appointments'
      });
      
      // Manejar mensajes
      ws.on('message', async (message: Buffer) => {
        try {
          const messageStr = message.toString();
          let data;
          
          try {
            data = JSON.parse(messageStr);
          } catch (parseError) {
            logger.error(`Invalid JSON received from appointment client ${clientId}: ${messageStr}`);
            this.sendToClient(clientId, {
              type: 'error',
              message: 'Formato de mensaje inválido'
            });
            return;
          }
          
          logger.info(`📅 Appointment message received from ${clientId}:`, data.type);
          
          // Actualizar última actividad
          if (this.clients.has(clientId)) {
            const client = this.clients.get(clientId)!;
            client.lastPing = new Date();
            client.isAlive = true;
          }
          
          switch (data.type) {
            case 'fetchAllAppointments':
              await this.handleFetchAllAppointments(clientId);
              break;
              
            case 'subscribeToUpdates':
              await this.handleSubscribeToUpdates(clientId);
              break;
              
            case 'ping':
              this.sendToClient(clientId, { type: 'pong' });
              logger.debug(`📅 Pong sent to client ${clientId}`);
              break;
              
            default:
              logger.warn(`Unknown appointment message type from ${clientId}: ${data.type}`);
              this.sendToClient(clientId, {
                type: 'error',
                message: 'Tipo de mensaje no reconocido'
              });
          }
        } catch (error) {
          logger.error(`Error handling appointment WebSocket message from ${clientId}:`, error);
          this.sendToClient(clientId, {
            type: 'error',
            message: 'Error interno al procesar el mensaje'
          });
        }
      });
      
      // Manejar pong (respuesta a nuestros pings)
      ws.on('pong', () => {
        logger.debug(`📅 Pong received from appointment client ${clientId}`);
        if (this.clients.has(clientId)) {
          const client = this.clients.get(clientId)!;
          client.isAlive = true;
          client.lastPing = new Date();
        }
      });
      
      // Manejar cierre de conexión
      ws.on('close', (code, reason) => {
        const reasonStr = reason ? reason.toString() : 'No reason provided';
        logger.info(`📅 WebSocket appointment client disconnected: ${clientId}, code: ${code}, reason: ${reasonStr}`);
        this.clients.delete(clientId);
        logger.info(`📅 Total connected clients: ${this.clients.size}`);
      });

      // Manejar errores
      ws.on('error', (error) => {
        logger.error(`📅 WebSocket appointment error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
    
    this.wss.on('error', (error) => {
      logger.error(`📅 WebSocket Appointment Server Error:`, error);
    });

    // Configurar ping interval para mantener conexiones activas
    this.startPingInterval();
    
    // Configurar limpieza periódica de clientes desconectados
    this.startCleanupInterval();
  }

  /**
   * Iniciar intervalo de ping
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const deadClients: string[] = [];
      
      this.clients.forEach((clientInfo, clientId) => {
        const { ws } = clientInfo;
        
        if (ws.readyState === WebSocket.OPEN) {
          if (clientInfo.isAlive === false) {
            // Cliente no respondió al ping anterior
            logger.warn(`📅 Client ${clientId} failed to respond to ping, terminating`);
            ws.terminate();
            deadClients.push(clientId);
            return;
          }
          
          // Marcar como no vivo y enviar ping
          clientInfo.isAlive = false;
          try {
            ws.ping();
            logger.debug(`📅 Ping sent to client ${clientId}`);
          } catch (error) {
            logger.error(`Error pinging appointment client ${clientId}:`, error);
            deadClients.push(clientId);
          }
        } else {
          // WebSocket no está abierto
          deadClients.push(clientId);
        }
      });
      
      // Limpiar clientes muertos
      deadClients.forEach(clientId => {
        this.clients.delete(clientId);
        logger.info(`📅 Removed dead client: ${clientId}`);
      });
      
      if (deadClients.length > 0) {
        logger.info(`📅 Cleaned up ${deadClients.length} dead clients. Active clients: ${this.clients.size}`);
      }
    }, 30000); // Ping cada 30 segundos
  }

  /**
   * Iniciar intervalo de limpieza
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupDisconnectedClients();
    }, 60000); // Limpiar cada minuto
  }

  /**
   * Enviar mensaje a un cliente específico
   */
  private sendToClient(clientId: string, message: any): boolean {
    const clientInfo = this.clients.get(clientId);
    if (!clientInfo) {
      logger.warn(`📅 Client ${clientId} not found`);
      return false;
    }

    const { ws } = clientInfo;
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        logger.error(`Error sending message to client ${clientId}:`, error);
        this.clients.delete(clientId);
        return false;
      }
    } else {
      logger.warn(`📅 Client ${clientId} WebSocket not open (state: ${ws.readyState})`);
      this.clients.delete(clientId);
      return false;
    }
  }

  /**
   * Manejar solicitud de todas las appointments
   */
  private async handleFetchAllAppointments(clientId: string): Promise<void> {
    try {
      logger.info(`📅 Fetching all appointments for client ${clientId}`);
      
      const appointments = await this.appointmentService.getAllAppointments();
      
      const success = this.sendToClient(clientId, {
        type: 'appointmentsList',
        appointments: appointments
      });
      
      if (success) {
        logger.info(`📅 Sent ${appointments.length} appointments to client ${clientId}`);
      } else {
        logger.warn(`📅 Failed to send appointments to client ${clientId}`);
      }
    } catch (error) {
      logger.error(`Error fetching appointments for client ${clientId}:`, error);
      this.sendToClient(clientId, { 
        type: 'error', 
        message: 'Error al obtener las appointments' 
      });
    }
  }

  /**
   * Manejar suscripción a actualizaciones
   */
  private async handleSubscribeToUpdates(clientId: string): Promise<void> {
    try {
      logger.info(`📅 Client ${clientId} subscribed to appointment updates`);
      
      this.sendToClient(clientId, {
        type: 'subscriptionConfirmed',
        message: 'Suscrito a actualizaciones de appointments'
      });
    } catch (error) {
      logger.error(`Error subscribing client ${clientId} to updates:`, error);
      this.sendToClient(clientId, { 
        type: 'error', 
        message: 'Error al suscribirse a actualizaciones' 
      });
    }
  }

  /**
   * Notificar nueva appointment a todos los clientes conectados
   */
  public notifyNewAppointment(appointment: any): void {
    const message = {
      type: 'newAppointment',
      appointment: appointment
    };

    this.broadcast(message, 'new appointment');
  }

  /**
   * Notificar appointment actualizada a todos los clientes conectados
   */
  public notifyAppointmentUpdated(appointment: any): void {
    const message = {
      type: 'appointmentUpdated',
      appointment: appointment
    };

    this.broadcast(message, 'appointment updated');
  }

  /**
   * Notificar appointment eliminada a todos los clientes conectados
   */
  public notifyAppointmentDeleted(appointmentId: number): void {
    const message = {
      type: 'appointmentDeleted',
      appointmentId: appointmentId
    };

    this.broadcast(message, 'appointment deleted');
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: any, action: string): void {
    let sentCount = 0;
    let errorCount = 0;

    this.clients.forEach((clientInfo, clientId) => {
      if (this.sendToClient(clientId, message)) {
        sentCount++;
      } else {
        errorCount++;
      }
    });

    logger.info(`📅 ${action} broadcasted to ${sentCount} clients (${errorCount} errors)`);
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
    // Limpiar intervalos
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Cerrar todas las conexiones de clientes
    this.clients.forEach((clientInfo, clientId) => {
      try {
        const { ws } = clientInfo;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Server shutdown');
        }
      } catch (error) {
        logger.error(`Error closing connection for client ${clientId}:`, error);
      }
    });
    
    this.clients.clear();
    
    // Cerrar el servidor WebSocket
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
    const now = new Date();
    const clientStats = Array.from(this.clients.values()).map(client => ({
      clientId: client.clientId,
      connectedAt: client.connectedAt,
      lastPing: client.lastPing,
      isAlive: client.isAlive,
      connectionDuration: now.getTime() - client.connectedAt.getTime()
    }));

    return {
      connectedClients: this.clients.size,
      serverStatus: this.wss ? 'running' : 'stopped',
      path: '/ws/appointments',
      uptime: process.uptime(),
      clients: clientStats
    };
  }

  /**
   * Limpiar clientes desconectados
   */
  public cleanupDisconnectedClients(): void {
    const disconnectedClients: string[] = [];
    const now = new Date();
    
    this.clients.forEach((clientInfo, clientId) => {
      const { ws, lastPing } = clientInfo;
      
      // Verificar si el WebSocket está cerrado
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        disconnectedClients.push(clientId);
      }
      // Verificar si el cliente no ha respondido en mucho tiempo (2 minutos)
      else if (now.getTime() - lastPing.getTime() > 120000) {
        logger.warn(`📅 Client ${clientId} inactive for too long, removing`);
        disconnectedClients.push(clientId);
        try {
          ws.terminate();
        } catch (error) {
          logger.error(`Error terminating inactive client ${clientId}:`, error);
        }
      }
    });

    disconnectedClients.forEach(clientId => {
      this.clients.delete(clientId);
      logger.info(`🧹 Cleaned up disconnected client: ${clientId}`);
    });

    if (disconnectedClients.length > 0) {
      logger.info(`🧹 Cleaned up ${disconnectedClients.length} disconnected clients. Active: ${this.clients.size}`);
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
      pingIntervalActive: this.pingInterval !== null,
      cleanupIntervalActive: this.cleanupInterval !== null
    };
  }
}