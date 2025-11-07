"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
/**
 * Configuración del transporter de nodemailer
 */
const transporter = nodemailer_1.default.createTransport({
    service: process.env.EMAIL_PROVIDER || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});
/**
 * Verificar la configuración de email al iniciar
 */
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error en la configuración de email:', error);
        console.error('   Verifica las credenciales en el archivo .env');
        console.error('   EMAIL_USER:', process.env.EMAIL_USER);
        console.error('   EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
    }
    else {
        console.log('✅ Servidor de email listo para enviar mensajes');
        console.log('📧 Email configurado:', process.env.EMAIL_USER);
    }
});
exports.default = transporter;
//# sourceMappingURL=email.config.js.map