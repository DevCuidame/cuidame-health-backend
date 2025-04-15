import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import config from './environment';
import path from 'path';

// Import all entities explicitly
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';
import { Allergy } from '../../models/allergy.model';
import { Condition } from '../../models/condition.model';
import { Background, FamilyBackground, Vaccine } from '../../models/background.model';
import { 
  HeartRate, 
  BloodPressure, 
  BloodGlucose, 
  BloodOxygen, 
  RespiratoryRate 
} from '../../models/vitals.models';
import { ControlMedicine } from '../../models/control-medicine.model';
import { Disease } from '../../models/diseases.model';
import { Department, Township } from '../../models/location.model';

const typeOrmConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  schema: config.database.schema,
  synchronize: false, // No sincronizar - ya tenemos una base de datos existente
  migrationsRun: false,
  logging: config.env === 'development' ? ['query', 'error', 'schema'] : false,
  
  // Register all entities explicitly
  entities: [
    // Main entities
    Patient,
    User,
    
    // Health condition entities
    Allergy,
    Condition,
    Disease,
    
    // Background entities
    Background,
    FamilyBackground,
    Vaccine,
    
    // Vital signs entities
    HeartRate,
    BloodPressure,
    BloodGlucose,
    BloodOxygen,
    RespiratoryRate,
    
    // Medicine entities
    ControlMedicine,
    
    // Location entities
    Department,
    Township,
    
    // Fallback to glob pattern for any missing entities
    path.join(__dirname, '../../models/**/*.{js,ts}')
  ],
  
  migrations: [path.join(__dirname, '../migrations/**/*.{js,ts}')],
  ssl: config.env === 'production',
};

const AppDataSource = new DataSource(typeOrmConfig);

export { AppDataSource, typeOrmConfig };