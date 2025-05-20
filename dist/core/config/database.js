"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const environment_1 = __importDefault(require("./environment"));
const path_1 = __importDefault(require("path"));
// Import all entities explicitly
const patient_model_1 = require("../../models/patient.model");
const user_model_1 = require("../../models/user.model");
const allergy_model_1 = require("../../models/allergy.model");
const condition_model_1 = require("../../models/condition.model");
const background_model_1 = require("../../models/background.model");
const vitals_models_1 = require("../../models/vitals.models");
const control_medicine_model_1 = require("../../models/control-medicine.model");
const diseases_model_1 = require("../../models/diseases.model");
const location_model_1 = require("../../models/location.model");
const typeOrmConfig = {
    type: 'postgres',
    host: environment_1.default.database.host,
    port: environment_1.default.database.port,
    username: environment_1.default.database.username,
    password: environment_1.default.database.password,
    database: environment_1.default.database.database,
    schema: environment_1.default.database.schema,
    synchronize: false, // No sincronizar - ya tenemos una base de datos existente
    migrationsRun: false,
    logging: environment_1.default.env === 'development' ? ['query', 'error', 'schema'] : false,
    // Register all entities explicitly
    entities: [
        // Main entities
        patient_model_1.Patient,
        user_model_1.User,
        // Health condition entities
        allergy_model_1.Allergy,
        condition_model_1.Condition,
        diseases_model_1.Disease,
        // Background entities
        background_model_1.Background,
        background_model_1.FamilyBackground,
        background_model_1.Vaccine,
        // Vital signs entities
        vitals_models_1.HeartRate,
        vitals_models_1.BloodPressure,
        vitals_models_1.BloodGlucose,
        vitals_models_1.BloodOxygen,
        vitals_models_1.RespiratoryRate,
        // Medicine entities
        control_medicine_model_1.ControlMedicine,
        // Location entities
        location_model_1.Department,
        location_model_1.Township,
        // Fallback to glob pattern for any missing entities
        path_1.default.join(__dirname, '../../models/**/*.{js,ts}')
    ],
    migrations: [path_1.default.join(__dirname, '../migrations/**/*.{js,ts}')],
    ssl: environment_1.default.env === 'production',
};
exports.typeOrmConfig = typeOrmConfig;
const AppDataSource = new typeorm_1.DataSource(typeOrmConfig);
exports.AppDataSource = AppDataSource;
