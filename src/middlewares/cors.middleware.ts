// src/middlewares/cors.middleware.ts
import { Request, Response, NextFunction } from 'express';
import config from '../core/config/environment';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:8100', 
    'http://localhost:4200', 
    'https://health.cuidame.tech'
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
  } else if (config.env === 'development') {
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

  next();
};