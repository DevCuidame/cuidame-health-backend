import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App;

  private constructor() {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public getApp(): admin.app.App {
    return this.app;
  }

  public getMessaging(): admin.messaging.Messaging {
    return admin.messaging(this.app);
  }
}

export default FirebaseConfig;