// src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log del error
  console.error('❌ Error capturado:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Definir código de estado
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Respuesta al cliente
  res.status(statusCode).json({
    success: false,
    status,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
};

// Middleware para errores de ruta no encontrada
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: CustomError = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  error.status = 'fail';
  next(error);
};

// Middleware para errores asíncronos
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};