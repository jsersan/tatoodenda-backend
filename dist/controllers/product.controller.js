"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const models_1 = __importDefault(require("../models"));
const sequelize_1 = require("sequelize");
const cache_service_1 = require("../services/cache.service"); // ✅ NUEVO
class ProductController {
    constructor() {
        // ✅ TTL de cache por tipo de consulta
        this.CACHE_TTL = {
            all: 600,
            single: 300,
            search: 120,
            category: 600 // 10 minutos para productos por categoría
        };
    }
    /**
     * 🔍 Buscar productos por término - CON CACHE
     */
    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string' || q.trim() === '') {
                return res.status(200).json([]);
            }
            const searchTerm = q.trim().toLowerCase();
            const cacheKey = `products:search:${searchTerm}`;
            // ✅ Intentar obtener del cache
            const cachedProducts = cache_service_1.cacheService.get(cacheKey);
            if (cachedProducts) {
                console.log(`✅ Cache hit para búsqueda: "${searchTerm}"`);
                return res.status(200).json(cachedProducts);
            }
            console.log(`🔍 Buscando productos con término: "${searchTerm}"`);
            const products = await models_1.default.Product.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { nombre: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                        { descripcion: { [sequelize_1.Op.like]: `%${searchTerm}%` } }
                    ]
                },
                include: [{
                        model: models_1.default.Category,
                        as: 'categoryInfo'
                    }],
                limit: 50 // ✅ Límite para evitar respuestas enormes
            });
            const productsJson = products.map((product) => product.toJSON());
            // ✅ Guardar en cache
            cache_service_1.cacheService.set(cacheKey, productsJson, this.CACHE_TTL.search);
            console.log(`✅ Productos encontrados: ${productsJson.length}`);
            return res.status(200).json(productsJson);
        }
        catch (error) {
            console.error('❌ Error al buscar productos:', error);
            return res.status(500).json({
                message: 'Error al buscar productos',
                error: error.message
            });
        }
    }
    /**
     * Obtener todos los productos - CON CACHE
     */
    async index(req, res) {
        try {
            const cacheKey = 'products:all';
            // ✅ Intentar obtener del cache
            const cachedProducts = cache_service_1.cacheService.get(cacheKey);
            if (cachedProducts) {
                console.log('✅ Cache hit para todos los productos');
                return res.status(200).json(cachedProducts);
            }
            const products = await models_1.default.Product.findAll({
                include: [{
                        model: models_1.default.Category,
                        as: 'categoryInfo'
                    }],
                order: [['id', 'DESC']] // ✅ Más recientes primero
            });
            const productsJson = products.map((product) => product.toJSON());
            // ✅ Guardar en cache
            cache_service_1.cacheService.set(cacheKey, productsJson, this.CACHE_TTL.all);
            console.log(`Total de productos encontrados: ${productsJson.length}`);
            return res.status(200).json(productsJson);
        }
        catch (error) {
            console.error('Error al obtener productos:', error);
            return res.status(500).json({
                message: 'Error al obtener productos',
                error: error.message
            });
        }
    }
    /**
     * Obtener un producto por ID - CON CACHE
     */
    async show(req, res) {
        try {
            const { id } = req.params;
            const cacheKey = `products:single:${id}`;
            // ✅ Intentar obtener del cache
            const cachedProduct = cache_service_1.cacheService.get(cacheKey);
            if (cachedProduct) {
                console.log(`✅ Cache hit para producto: ${id}`);
                return res.status(200).json(cachedProduct);
            }
            const product = await models_1.default.Product.findByPk(id, {
                include: [{
                        model: models_1.default.Category,
                        as: 'categoryInfo'
                    }]
            });
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            const productJson = product.toJSON();
            // ✅ Guardar en cache
            cache_service_1.cacheService.set(cacheKey, productJson, this.CACHE_TTL.single);
            return res.status(200).json(productJson);
        }
        catch (error) {
            console.error('Error al obtener producto:', error);
            return res.status(500).json({
                message: 'Error al obtener producto',
                error: error.message
            });
        }
    }
    /**
     * Obtener productos por categoría - CON CACHE
     */
    async getProductsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const cacheKey = `products:category:${categoryId}`;
            // ✅ Intentar obtener del cache
            const cachedProducts = cache_service_1.cacheService.get(cacheKey);
            if (cachedProducts) {
                console.log(`✅ Cache hit para categoría: ${categoryId}`);
                return res.status(200).json(cachedProducts);
            }
            const products = await models_1.default.Product.findAll({
                where: { categoria: categoryId },
                include: [{
                        model: models_1.default.Category,
                        as: 'categoryInfo'
                    }]
            });
            const productsJson = products.map((product) => product.toJSON());
            // ✅ Guardar en cache
            cache_service_1.cacheService.set(cacheKey, productsJson, this.CACHE_TTL.category);
            console.log(`Productos encontrados para categoría ${categoryId}: ${productsJson.length}`);
            return res.status(200).json(productsJson);
        }
        catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            return res.status(500).json({
                message: 'Error al obtener productos por categoría',
                error: error.message
            });
        }
    }
    /**
     * Crear producto - INVALIDA CACHE
     */
    async store(req, res) {
        try {
            const { nombre, descripcion, precio, categoria_id, imagen } = req.body;
            const newProduct = await models_1.default.Product.create({
                nombre,
                descripcion,
                precio,
                categoria_id,
                imagen
            });
            // ✅ Invalidar cache relacionado
            cache_service_1.cacheService.deletePattern('products:*');
            console.log('🗑️ Cache de productos invalidado tras crear');
            return res.status(201).json(newProduct.toJSON());
        }
        catch (error) {
            console.error('Error al crear producto:', error);
            return res.status(500).json({
                message: 'Error al crear producto',
                error: error.message
            });
        }
    }
    /**
     * Actualizar producto - INVALIDA CACHE
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, precio, categoria_id, imagen } = req.body;
            const product = await models_1.default.Product.findByPk(id);
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
            cache_service_1.cacheService.deletePattern('products:*');
            console.log('🗑️ Cache de productos invalidado tras actualizar');
            return res.status(200).json(product.toJSON());
        }
        catch (error) {
            console.error('Error al actualizar producto:', error);
            return res.status(500).json({
                message: 'Error al actualizar producto',
                error: error.message
            });
        }
    }
    /**
     * Eliminar producto - INVALIDA CACHE
     */
    async destroy(req, res) {
        try {
            const { id } = req.params;
            const product = await models_1.default.Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            await product.destroy();
            // ✅ Invalidar cache relacionado
            cache_service_1.cacheService.deletePattern('products:*');
            console.log('🗑️ Cache de productos invalidado tras eliminar');
            return res.status(200).json({ message: 'Producto eliminado correctamente' });
        }
        catch (error) {
            console.error('Error al eliminar producto:', error);
            return res.status(500).json({
                message: 'Error al eliminar producto',
                error: error.message
            });
        }
    }
    /**
     * Obtener Colors disponibles del producto
     */
    async getColors(req, res) {
        try {
            const { id } = req.params;
            const productId = parseInt(id);
            if (isNaN(productId)) {
                return res.status(400).json({ message: 'ID de producto no válido' });
            }
            const colors = await models_1.default.sequelize.query('SELECT DISTINCT color FROM lineapedido WHERE idprod = :productId', {
                replacements: { productId },
                type: models_1.default.sequelize.QueryTypes.SELECT
            });
            if (!colors || colors.length === 0) {
                const allColors = await models_1.default.sequelize.query('SELECT id, nombre as color, codigo_color FROM product_colors', {
                    type: models_1.default.sequelize.QueryTypes.SELECT
                });
                return res.status(200).json(allColors);
            }
            return res.status(200).json(colors);
        }
        catch (error) {
            console.error('Error al obtener colores del producto:', error);
            return res.status(500).json({
                message: 'Error al obtener colores',
                error: error.message
            });
        }
    }
    /**
     * Obtener imagen del producto
     */
    getImage(req, res) {
        try {
            const { categoria, imagen } = req.params;
            const imagePath = path_1.default.join(__dirname, '../../public/images', categoria, imagen);
            if (!fs_1.default.existsSync(imagePath)) {
                res.status(404).json({ message: 'Imagen no encontrada' });
                return;
            }
            res.sendFile(imagePath);
        }
        catch (error) {
            console.error('Error al obtener imagen:', error);
            res.status(500).json({
                message: 'Error al obtener imagen',
                error: error.message
            });
        }
    }
}
exports.default = new ProductController();
//# sourceMappingURL=product.controller.js.map