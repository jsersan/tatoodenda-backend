// src/routes/category.routes.ts - CON DEBUGGING

import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { categoryDebugMiddleware } from '../middleware/debug.middleware';

const router = Router();

// ========================================
// MIDDLEWARE DE DEBUGGING (solo desarrollo)
// ========================================
if (process.env.NODE_ENV === 'development') {
  router.use(categoryDebugMiddleware);
}

// ========================================
// RUTAS PÚBLICAS (no requieren autenticación)
// ========================================

/**
 * GET /api/categorias
 * Obtiene todas las categorías
 * Público - no requiere autenticación
 */
router.get('/', async (req, res) => {
  try {
    console.log('🏷️  Ejecutando findAll de categorías');
    await categoryController.findAll(req, res);
  } catch (error) {
    console.error('❌ Error en GET /categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * GET /api/categorias/:id
 * Obtiene una categoría específica por ID
 * Público - no requiere autenticación
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('🏷️  Ejecutando findOne para categoría ID:', req.params.id);
    await categoryController.findOne(req, res);
  } catch (error) {
    console.error('❌ Error en GET /categorias/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// ========================================
// RUTAS ADMINISTRATIVAS (requieren autenticación y permisos)
// ========================================

/**
 * POST /api/categorias
 * Crea una nueva categoría
 * Requiere: autenticación + rol admin
 */
router.post('/', [verifyToken, isAdmin], async (req, res) => {
  try {
    console.log('🏷️  Ejecutando create de categoría');
    await categoryController.create(req, res);
  } catch (error) {
    console.error('❌ Error en POST /categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * PUT /api/categorias/:id
 * Actualiza una categoría existente
 * Requiere: autenticación + rol admin
 */
router.put('/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    console.log('🏷️  Ejecutando update de categoría ID:', req.params.id);
    await categoryController.update(req, res);
  } catch (error) {
    console.error('❌ Error en PUT /categorias/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * DELETE /api/categorias/:id
 * Elimina una categoría
 * Requiere: autenticación + rol admin
 */
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
  try {
    console.log('🏷️  Ejecutando delete de categoría ID:', req.params.id);
    await categoryController.delete(req, res);
  } catch (error) {
    console.error('❌ Error en DELETE /categorias/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// ========================================
// RUTA DE TEST (solo desarrollo)
// ========================================
if (process.env.NODE_ENV === 'development') {
  router.get('/test/ping', (req, res) => {
    res.json({
      success: true,
      message: 'Category routes working!',
      timestamp: new Date().toISOString()
    });
  });
}

export default router;