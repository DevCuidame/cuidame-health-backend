"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const environment_1 = __importDefault(require("../core/config/environment"));
const corsMiddleware = (req, res, next) => {
    // Si es una solicitud de upgrade de WebSocket, permite la conexión
    if (req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() === 'websocket') {
        return next();
    }
    // Define allowed origins
    const allowedOrigins = [
        'http://localhost:8100',
        'http://localhost:4200',
        'https://health.cuidame.tech',
    ];
    // Get the origin from the request
    const origin = req.headers.origin;
    // Check if the origin is allowed or if we're in development
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        console.log('CORS headers set for origin:', origin);
    }
    else if (environment_1.default.env === 'development') {
        // In development, allow any origin
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        console.log('CORS headers set for development');
    }
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        res.status(204).end();
        return;
    }
    // Siempre llama a next() para solicitudes no-OPTIONS
    next();
};
exports.corsMiddleware = corsMiddleware;
