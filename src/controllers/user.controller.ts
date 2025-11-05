/**
 * Controlador de Usuarios - VERSIÓN FINAL CORREGIDA
 * ✅ Imports corregidos
 * ✅ JWT funcionando correctamente
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // ✅ CORRECCIÓN: Import correcto sin { Secret }
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import db from '../models';
import authConfig from '../config/auth';
import { IUser, IUserResponse, ILoginRequest } from '../interfaces/user.interface';

// Extender el tipo Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// Referencia al modelo User
const User = db.User;

// ============================================
// CONFIGURACIÓN DE NODEMAILER
// ============================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * ✅ Generador de token JWT - CORREGIDO
 */
const generateToken = (userId: number): string => {
  const token = jwt.sign(
    { id: userId },
    authConfig.secret,
    { expiresIn: authConfig.expiresIn } as any // ✅ Fix para TypeScript
  );
  return token;
};

/**
 * ✅ Función que elimina solo el password del usuario
 */
function sanitizeUser(user: any): IUserResponse {
  const userObject = user.toJSON();
  
  // Solo eliminar el password, mantener TODOS los demás campos
  const { password, ...userWithoutPassword } = userObject;
  
  console.log('✅ Usuario sanitizado:', userWithoutPassword);
  
  return userWithoutPassword as IUserResponse;
}

/**
 * Controlador de usuarios
 */
const userController = {
  /**
   * Registrar un nuevo usuario
   */
  register: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username, email, password, nombre, direccion, ciudad, cp } = req.body;

      console.log('📝 Intentando registrar usuario:', { username, email, nombre });

      // Validaciones básicas
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Hash de la contraseña
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Crear usuario
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        nombre: nombre || username,
        direccion: direccion || '',
        ciudad: ciudad || '',
        cp: cp || '',
        role: 'user'
      });

      console.log('✅ Usuario registrado con ID:', newUser.get('id'));

      // Generar token
      const token = generateToken(newUser.get('id') as number);

      // Devolver usuario completo (sin password)
      const userResponse = sanitizeUser(newUser);

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        ...userResponse,
        token
      });

    } catch (error) {
      console.error('❌ Error en registro:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
      }
      return res.status(500).json({ message: 'Error al registrar usuario' });
    }
  },

  /**
   * ✅ LOGIN - Devuelve TODOS los campos del usuario
   */
  login: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username, password }: ILoginRequest = req.body;

      console.log('🔐 Intento de login para usuario:', username);

      // Validaciones
      if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
      }

      // Buscar usuario
      const user = await User.findOne({ where: { username } });
      
      if (!user) {
        console.log('❌ Usuario no encontrado:', username);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const validPassword = bcrypt.compareSync(password, user.get('password') as string);
      
      if (!validPassword) {
        console.log('❌ Contraseña incorrecta para:', username);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      console.log('✅ Login exitoso para:', username);

      // Generar token
      const token = generateToken(user.get('id') as number);

      // Devolver usuario completo con TODOS los campos
      const userResponse = sanitizeUser(user);

      console.log('📤 Enviando respuesta con usuario completo:', {
        id: userResponse.id,
        username: userResponse.username,
        nombre: userResponse.nombre,
        email: userResponse.email,
        direccion: userResponse.direccion,
        ciudad: userResponse.ciudad,
        cp: userResponse.cp
      });

      // Respuesta con TODOS los campos
      return res.status(200).json({
        message: 'Login exitoso',
        ...userResponse,
        token
      });

    } catch (error) {
      console.error('❌ Error en login:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
      }
      return res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  profile: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const userResponse = sanitizeUser(user);

      return res.status(200).json({
        ...userResponse
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
      }
      return res.status(500).json({ message: 'Error al obtener perfil' });
    }
  },

  /**
   * Actualizar usuario
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const { username, email, nombre, direccion, ciudad, cp } = req.body;

      console.log('📝 Actualizando usuario:', id);

      // Verificar permisos
      if (Number(id) !== userId && !(await isAdmin(userId))) {
        return res.status(403).json({ message: 'No autorizado para actualizar este usuario' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Actualizar campos
      if (username) user.set('username', username);
      if (email) user.set('email', email);
      if (nombre) user.set('nombre', nombre);
      if (direccion) user.set('direccion', direccion);
      if (ciudad) user.set('ciudad', ciudad);
      if (cp) user.set('cp', cp);

      await user.save();

      console.log('✅ Usuario actualizado:', id);

      const userResponse = sanitizeUser(user);

      return res.status(200).json({
        message: 'Usuario actualizado exitosamente',
        ...userResponse
      });

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
      }
      return res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  },

  // ============================================
  // MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  forgotPassword: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;
      
      console.log('📧 Solicitud de recuperación para:', email);

      if (!email || !email.includes('@')) {
        return res.status(400).json({ 
          message: 'Email inválido' 
        });
      }

      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        console.log('⚠️ Email no encontrado:', email);
        return res.status(200).json({ 
          message: 'Si el email existe, recibirás un enlace de recuperación' 
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await user.update({
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      });

      console.log('✅ Token generado para usuario:', user.get('id'));

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #52667a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background-color: #f9f9f9; border: 1px solid #e0e0e0; }
            .button { 
              display: inline-block; 
              padding: 14px 32px; 
              background-color: #52667a; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .url-box {
              background: white;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 4px;
              word-break: break-all;
              color: #0066cc;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Recuperación de Contraseña</h2>
            </div>
            <div class="content">
              <p>Hola <strong>${user.get('username')}</strong>,</p>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </p>
              <p>O copia y pega este enlace en tu navegador:</p>
              <div class="url-box">${resetUrl}</div>
              <p><strong>⏰ Este enlace expirará en 1 hora.</strong></p>
              <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Tu Tienda'}. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Tu Tienda'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Recuperación de Contraseña',
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);

      console.log('✅ Email enviado a:', email);

      return res.status(200).json({ 
        message: 'Si el email existe, recibirás un enlace de recuperación',
        success: true 
      });

    } catch (error) {
      console.error('❌ Error en forgot-password:', error);
      if (error instanceof Error) {
        return res.status(500).json({ 
          message: 'Error al procesar la solicitud',
          error: error.message 
        });
      }
      return res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
  },

  resetPassword: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { token, newPassword } = req.body;

      console.log('🔑 Intentando restablecer contraseña con token');

      if (!token || !newPassword) {
        return res.status(400).json({ 
          message: 'Token y contraseña son requeridos' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      const user = await User.findOne({
        where: {
          resetToken: token
        }
      });

      if (!user) {
        console.log('⚠️ Token inválido');
        return res.status(400).json({ 
          message: 'Token inválido o expirado' 
        });
      }

      const tokenExpiry = user.get('resetTokenExpiry') as Date;
      if (!tokenExpiry || new Date() > tokenExpiry) {
        console.log('⚠️ Token expirado');
        return res.status(400).json({ 
          message: 'Token inválido o expirado' 
        });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      await user.update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });

      console.log('✅ Contraseña restablecida para usuario:', user.get('id'));

      const confirmEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2e7d32; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background-color: #f9f9f9; border: 1px solid #e0e0e0; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Contraseña Actualizada</h2>
            </div>
            <div class="content">
              <p>Hola <strong>${user.get('username')}</strong>,</p>
              <p>Tu contraseña ha sido <strong>restablecida exitosamente</strong>.</p>
              <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
              <div class="warning">
                <strong>⚠️ Importante:</strong> Si no realizaste este cambio, contacta con nuestro soporte inmediatamente.
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'Tu Tienda'}" <${process.env.EMAIL_USER}>`,
        to: user.get('email') as string,
        subject: '✅ Contraseña Actualizada',
        html: confirmEmailHtml
      });

      return res.status(200).json({ 
        message: 'Contraseña restablecida exitosamente',
        success: true 
      });

    } catch (error) {
      console.error('❌ Error en reset-password:', error);
      if (error instanceof Error) {
        return res.status(500).json({ 
          message: 'Error al restablecer la contraseña',
          error: error.message 
        });
      }
      return res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
  },

  verifyResetToken: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        where: {
          resetToken: token
        }
      });

      if (!user) {
        return res.status(400).json({ 
          valid: false,
          message: 'Token inválido o expirado' 
        });
      }

      const tokenExpiry = user.get('resetTokenExpiry') as Date;
      if (!tokenExpiry || new Date() > tokenExpiry) {
        return res.status(400).json({ 
          valid: false,
          message: 'Token inválido o expirado' 
        });
      }

      return res.status(200).json({ 
        valid: true,
        message: 'Token válido' 
      });

    } catch (error) {
      console.error('❌ Error verificando token:', error);
      return res.status(500).json({ 
        valid: false,
        message: 'Error al verificar token' 
      });
    }
  }
};

/**
 * Función auxiliar para verificar si un usuario es administrador
 */
const isAdmin = async (userId: number | undefined): Promise<boolean> => {
  if (!userId) return false;
  const user = await User.findByPk(userId);
  return user && (user.get('username') === 'admin' || user.get('role') === 'admin');
};

export default userController;