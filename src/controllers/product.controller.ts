// src/controllers/product.controller.ts - OPTIMIZADO CON CACHE
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import db from '../models';
import { IProduct } from '../interfaces/product.interface';
import { Op } from 'sequelize';
import { cacheService } from '../services/cache.service';  // ✅ NUEVO

class ProductController {
  // ✅ TTL de cache por tipo de consulta
  private readonly CACHE_TTL = {
    all: 600,        // 10 minutos para lista completa
    single: 300,     // 5 minutos para producto individual
    search: 120,     // 2 minutos para búsquedas
    category: 600    // 10 minutos para productos por categoría
  };

  /**
   * 🔍 Buscar productos por término - CON CACHE
   */
  async search(req: Request, res: Response): Promise<Response> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim() === '') {
        return res.status(200).json([]);
      }

      const searchTerm = q.trim().toLowerCase();
      const cacheKey = `products:search:${searchTerm}`;
      
      // ✅ Intentar obtener del cache
      const cachedProducts = cacheService.get(cacheKey);
      if (cachedProducts) {
        console.log(`✅ Cache hit para búsqueda: "${searchTerm}"`);
        return res.status(200).json(cachedProducts);
      }

      console.log(`🔍 Buscando productos con término: "${searchTerm}"`);

      const products = await db.Product.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${searchTerm}%` } },
            { descripcion: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        include: [{
          model: db.Category,
          as: 'categoryInfo'
        }],
        limit: 50  // ✅ Límite para evitar respuestas enormes
      });

      const productsJson = products.map((product: any) => product.toJSON());
      
      // ✅ Guardar en cache
      cacheService.set(cacheKey, productsJson, this.CACHE_TTL.search);
      
      console.log(`✅ Productos encontrados: ${productsJson.length}`);
      return res.status(200).json(productsJson);
    } catch (error) {
      console.error('❌ Error al buscar productos:', error);
      return res.status(500).json({ 
        message: 'Error al buscar productos', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Obtener todos los productos - CON CACHE
   */
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const cacheKey = 'products:all';
      
      // ✅ Intentar obtener del cache
      const cachedProducts = cacheService.get(cacheKey);
      if (cachedProducts) {
        console.log('✅ Cache hit para todos los productos');
        return res.status(200).json(cachedProducts);
      }

      const products = await db.Product.findAll({
        include: [{
          model: db.Category,
          as: 'categoryInfo'
        }],
        order: [['id', 'DESC']]  // ✅ Más recientes primero
      });

      const productsJson = products.map((product: any) => product.toJSON());
      
      // ✅ Guardar en cache
      cacheService.set(cacheKey, productsJson, this.CACHE_TTL.all);
      
      console.log(`Total de productos encontrados: ${productsJson.length}`);
      return res.status(200).json(productsJson);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ 
        message: 'Error al obtener productos', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Obtener un producto por ID - CON CACHE
   */
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const cacheKey = `products:single:${id}`;
      
      // ✅ Intentar obtener del cache
      const cachedProduct = cacheService.get(cacheKey);
      if (cachedProduct) {
        console.log(`✅ Cache hit para producto: ${id}`);
        return res.status(200).json(cachedProduct);
      }
      
      const product = await db.Product.findByPk(id, {
        include: [{
          model: db.Category,
          as: 'categoryInfo'
        }]
      });

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const productJson = product.toJSON();
      
      // ✅ Guardar en cache
      cacheService.set(cacheKey, productJson, this.CACHE_TTL.single);

      return res.status(200).json(productJson);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return res.status(500).json({ 
        message: 'Error al obtener producto', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Obtener productos por categoría - CON CACHE
   */
  async getProductsByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { categoryId } = req.params;
      const cacheKey = `products:category:${categoryId}`;
      
      // ✅ Intentar obtener del cache
      const cachedProducts = cacheService.get(cacheKey);
      if (cachedProducts) {
        console.log(`✅ Cache hit para categoría: ${categoryId}`);
        return res.status(200).json(cachedProducts);
      }
      
      const products = await db.Product.findAll({
        where: { categoria: categoryId },
        include: [{
          model: db.Category,
          as: 'categoryInfo'
        }]
      });

      const productsJson = products.map((product: any) => product.toJSON());
      
      // ✅ Guardar en cache
      cacheService.set(cacheKey, productsJson, this.CACHE_TTL.category);
      
      console.log(`Productos encontrados para categoría ${categoryId}: ${productsJson.length}`);
      return res.status(200).json(productsJson);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      return res.status(500).json({ 
        message: 'Error al obtener productos por categoría', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Crear producto - INVALIDA CACHE
   */
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, descripcion, precio, categoria_id, imagen } = req.body;

      const newProduct = await db.Product.create({
        nombre,
        descripcion,
        precio,
        categoria_id,
        imagen
      });

      // ✅ Invalidar cache relacionado
      cacheService.deletePattern('products:*');
      console.log('🗑️ Cache de productos invalidado tras crear');

      return res.status(201).json(newProduct.toJSON());
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ 
        message: 'Error al crear producto', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Actualizar producto - INVALIDA CACHE
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, categoria_id, imagen } = req.body;

      const product = await db.Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      await product.update({
        nombre,
        descripcion,
        precio,
        categoria_id,
        imagen
      });

      // ✅ Invalidar cache relacionado
      cacheService.deletePattern('products:*');
      console.log('🗑️ Cache de productos invalidado tras actualizar');

      return res.status(200).json(product.toJSON());
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ 
        message: 'Error al actualizar producto', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Eliminar producto - INVALIDA CACHE
   */
  async destroy(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const product = await db.Product.findByPk(id);

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      await product.destroy();

      // ✅ Invalidar cache relacionado
      cacheService.deletePattern('products:*');
      console.log('🗑️ Cache de productos invalidado tras eliminar');

      return res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ 
        message: 'Error al eliminar producto', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Obtener Colors disponibles del producto
   */
  async getColors(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: 'ID de producto no válido' });
      }
      
      const colors = await db.sequelize.query(
        'SELECT DISTINCT color FROM lineapedido WHERE idprod = :productId',
        {
          replacements: { productId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      
      if (!colors || colors.length === 0) {
        const allColors = await db.sequelize.query(
          'SELECT id, nombre as color, codigo_color FROM product_colors',
          {
            type: db.sequelize.QueryTypes.SELECT
          }
        );
        
        return res.status(200).json(allColors);
      }
      
      return res.status(200).json(colors);
    } catch (error) {
      console.error('Error al obtener colores del producto:', error);
      return res.status(500).json({ 
        message: 'Error al obtener colores', 
        error: (error as Error).message 
      });
    }
  }

  /**
   * Obtener imagen del producto
   */
  getImage(req: Request, res: Response): void {
    try {
      const { categoria, imagen } = req.params;
      const imagePath = path.join(__dirname, '../../public/images', categoria, imagen);

      if (!fs.existsSync(imagePath)) {
        res.status(404).json({ message: 'Imagen no encontrada' });
        return;
      }

      res.sendFile(imagePath);
    } catch (error) {
      console.error('Error al obtener imagen:', error);
      res.status(500).json({ 
        message: 'Error al obtener imagen', 
        error: (error as Error).message 
      });
    }
  }
}

export default new ProductController();