# Integración Firebase Push Notifications con Angular/Ionic

## 🔧 Problema Resuelto

El error `Property 'sendMulticast' does not exist on type 'Messaging'` ha sido solucionado cambiando a `sendEachForMulticast` que es más compatible con la versión actual de Firebase Admin SDK.

## 📱 Configuración para Angular/Ionic

### 1. Instalación en el Frontend

```bash
# Instalar dependencias de Firebase
npm install @angular/fire firebase
npm install @capacitor/push-notifications
```

### 2. Configuración en Angular/Ionic

#### `src/app/services/firebase-push.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

export interface RegisterTokenRequest {
  token: string;
  platform: 'android' | 'ios' | 'web';
  deviceInfo?: string;
  appVersion?: string;
  osVersion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebasePushService {
  private apiUrl = `${environment.apiUrl}/firebase-push`;

  constructor(private http: HttpClient) {}

  async initializePushNotifications() {
    if (Capacitor.isNativePlatform()) {
      await this.requestPermissions();
      await this.registerListeners();
      await this.getToken();
    }
  }

  private async requestPermissions() {
    const result = await PushNotifications.requestPermissions();
    if (result.receive !== 'granted') {
      throw new Error('Permisos de notificaciones denegados');
    }
  }

  private async registerListeners() {
    // Listener para cuando se registra el token
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      this.registerTokenOnServer(token.value);
    });

    // Listener para errores de registro
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listener para notificaciones recibidas
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ' + JSON.stringify(notification));
      this.handleNotificationReceived(notification);
    });

    // Listener para acciones en notificaciones
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      this.handleNotificationAction(notification);
    });
  }

  private async getToken() {
    await PushNotifications.register();
  }

  private async registerTokenOnServer(token: string) {
    try {
      const platform = Capacitor.getPlatform() as 'android' | 'ios' | 'web';
      const deviceInfo = await this.getDeviceInfo();
      
      const request: RegisterTokenRequest = {
        token,
        platform,
        deviceInfo: JSON.stringify(deviceInfo),
        appVersion: environment.appVersion,
        osVersion: deviceInfo.osVersion
      };

      await this.http.post(`${this.apiUrl}/register-enhanced`, request).toPromise();
      console.log('Token registrado exitosamente en el servidor');
    } catch (error) {
      console.error('Error registrando token:', error);
    }
  }

  private async getDeviceInfo() {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    return {
      model: info.model,
      platform: info.platform,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual
    };
  }

  private handleNotificationReceived(notification: PushNotificationSchema) {
    // Manejar notificación recibida cuando la app está en primer plano
    // Puedes mostrar un toast, actualizar el estado, etc.
  }

  private handleNotificationAction(notification: ActionPerformed) {
    // Manejar cuando el usuario toca la notificación
    const data = notification.notification.data;
    
    if (data?.clickAction) {
      // Navegar a la ruta especificada
      // this.router.navigate([data.clickAction]);
    }
  }

  // Método para suscribirse a topics
  async subscribeToTopic(topic: string) {
    try {
      await this.http.post(`${this.apiUrl}/subscribe-topic`, { topic }).toPromise();
      console.log(`Suscrito al topic: ${topic}`);
    } catch (error) {
      console.error('Error suscribiéndose al topic:', error);
    }
  }

  // Método para obtener estadísticas
  async getNotificationStats() {
    try {
      return await this.http.get(`${this.apiUrl}/stats`).toPromise();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }
}
```

### 3. Configuración en `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cuidamehealth.app',
  appName: 'CuidameHealth',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
```

### 4. Configuración de Firebase en Angular

#### `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appVersion: '1.0.0',
  firebase: {
    apiKey: 'tu-api-key',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto-firebase',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '123456789',
    appId: 'tu-app-id'
  }
};
```

### 5. Inicialización en `app.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { FirebasePushService } from './services/firebase-push.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private firebasePush: FirebasePushService) {}

  async ngOnInit() {
    await this.firebasePush.initializePushNotifications();
  }
}
```

## 🚀 Endpoints Disponibles

### Endpoints Básicos
- `POST /api/firebase-push/register-token` - Registrar token básico
- `POST /api/firebase-push/unregister-token` - Desregistrar token
- `POST /api/firebase-push/test` - Enviar notificación de prueba

### Endpoints Optimizados para Angular/Ionic
- `POST /api/firebase-push/register-enhanced` - Registrar token con información extendida
- `POST /api/firebase-push/bulk-enhanced` - Enviar notificaciones masivas
- `POST /api/firebase-push/subscribe-topic` - Suscribir a topics
- `GET /api/firebase-push/stats` - Obtener estadísticas de notificaciones

## 📋 Ejemplos de Uso

### Registrar Token Extendido
```typescript
POST /api/firebase-push/register-enhanced
{
  "token": "fcm-token-here",
  "platform": "android",
  "deviceInfo": "Samsung Galaxy S21",
  "appVersion": "1.0.0",
  "osVersion": "Android 12"
}
```

### Enviar Notificación Masiva
```typescript
POST /api/firebase-push/bulk-enhanced
{
  "userIds": [1, 2, 3, 4, 5],
  "title": "Nueva Actualización",
  "body": "Hay nuevas funcionalidades disponibles",
  "data": {
    "type": "update",
    "version": "1.1.0"
  },
  "clickAction": "/tabs/updates",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Suscribir a Topic
```typescript
POST /api/firebase-push/subscribe-topic
{
  "topic": "health_tips"
}
```

## 🔧 Configuración de Canales de Notificación (Android)

Para Android, asegúrate de configurar el canal de notificaciones en `android/app/src/main/java/.../MainActivity.java`:

```java
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    createNotificationChannel();
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      CharSequence name = "CuidameHealth Notifications";
      String description = "Notificaciones de la aplicación CuidameHealth";
      int importance = NotificationManager.IMPORTANCE_HIGH;
      NotificationChannel channel = new NotificationChannel("cuidame_health_notifications", name, importance);
      channel.setDescription(description);
      
      NotificationManager notificationManager = getSystemService(NotificationManager.class);
      notificationManager.createNotificationChannel(channel);
    }
  }
}
```

## 🎯 Mejoras Implementadas

1. **Compatibilidad mejorada**: Uso de `sendEachForMulticast` en lugar de `sendMulticast`
2. **Configuración específica para Angular/Ionic**: Optimización de payloads para cada plataforma
3. **Manejo de tokens mejorado**: Información extendida del dispositivo
4. **Estadísticas**: Endpoint para obtener métricas de notificaciones
5. **Topics**: Soporte mejorado para suscripciones a topics
6. **Validación robusta**: DTOs con validaciones específicas
7. **Manejo de errores**: Mejor gestión de tokens inválidos

## 🔐 Variables de Entorno Requeridas

```env
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-clave-privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
```

¡El módulo está optimizado y listo para usar con Angular/Ionic! 🚀