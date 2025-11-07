"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
/* Middleware de Carga de Archivos
 * Configura Multer para gestionar subidas de imágenes */
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/* Configurar el almacenamiento de archivos
 * Define dónde y cómo se guardarán los archivos subidos */
const storage = multer_1.default.diskStorage({
    // Función para determinar el directorio de destino
    destination: (req, file, cb) => {
        // Obtener la carpeta para el producto desde el cuerpo de la solicitud o URL
        const productId = req.params.id;
        const carpetaImg = req.body.carpetaimg || 'default';
        // Construir la ruta completa para guardar las imágenes
        const uploadPath = path_1.default.join(__dirname, '../../uploads/products', carpetaImg);
        // Crear la carpeta si no existe
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        // Llamar al callback con la ruta de destino
        cb(null, uploadPath);
    },
    // Función para generar el nombre del archivo
    filename: (req, file, cb) => {
        // Generar nombre único basado en timestamp y número aleatorio
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Obtener la extensión del archivo original
        const ext = path_1.default.extname(file.originalname);
        // Generar nombre final: prefijo + sufijo único + extensión
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
/* Filtro para tipos de archivo permitidos
 * Solo permite subir imágenes */
const fileFilter = (req, file, cb) => {
    // Tipos MIME permitidos (solo imágenes)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        // Archivo permitido
        cb(null, true);
    }
    else {
        // Archivo rechazado
        cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP).'));
    }
};
/* Configuración de Multer
 * Exporta un middleware listo para usar en rutas */
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB por archivo
    }
});
//# sourceMappingURL=upload.middleware.js.map