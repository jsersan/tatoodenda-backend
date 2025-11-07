// src/server.ts - VERSIÓN SIMPLIFICADA PARA RENDER

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Iniciando servidor TatooDenda...');
console.log('📍 Puerto configurado:', PORT);

// CORS básico
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'TatooDenda API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      test: '/test'
    }
  });
});

// Test endpoint
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Backend TatooDenda funcionando',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.url
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🎉 ================================');
  console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
  console.log('🎉 ================================');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log('🎉 ================================\n');
});

export default app;
