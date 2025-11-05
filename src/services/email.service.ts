// ============================================
// EMAIL SERVICE - CON RESEND (CORREGIDO)
// src/services/email.service.ts
// ============================================

import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

// Inicializar Resend con la API Key
const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailService {
  /**
   * Envía el albarán del pedido por email usando Resend
   */
  async enviarAlbaran (
    pedido: any,
    lineas: any[],
    usuario: any,
    pdfBuffer: Buffer
  ): Promise<boolean> {
    try {
      // Validar que el usuario tenga email
      if (!usuario || !usuario.email) {
        console.error('❌ El usuario no tiene email configurado')
        return false
      }

      console.log('📧 Preparando email con Resend para:', usuario.email)

      // Calcular el total
      const total =
        pedido.total ||
        lineas.reduce((sum: number, linea: any) => {
          const precio = linea.precio || linea.product?.precio || 0
          const cantidad = linea.cant || linea.cantidad || 0
          return sum + precio * cantidad
        }, 0)

      // Generar el HTML del email
      const htmlContent = this.generarHTMLEmail(pedido, lineas, usuario, total)

      // Enviar email con Resend
      // Enviar email con Resend
      const { data, error } = await resend.emails.send({
        from: 'TatooDenda <onboarding@resend.dev>', // ✅ Dominio de prueba de Resend
        to: [usuario.email],
        subject: `✅ Confirmación de Pedido #${pedido.id} - TatooDenda`,
        html: htmlContent,
        attachments: [
          {
            filename: `Albaran_Pedido_${pedido.id}.pdf`,
            content: pdfBuffer
          }
        ]
      })

      // Verificar si hubo error
      if (error) {
        console.error('❌ Error de Resend:', error)
        return false
      }

      console.log('✅ Email enviado exitosamente con Resend')
      console.log('   📧 Destinatario:', usuario.email)
      console.log('   📦 Pedido ID:', pedido.id)
      // Líneas comentadas para evitar el error TS2339
      // if (data) {
      //   console.log('   🆔 Resend ID:', data.id);
      // }

      return true
    } catch (error: any) {
      console.error('❌ Error al enviar email con Resend:', error)
      if (error.message) {
        console.error('   Mensaje:', error.message)
      }
      // No lanzar error para que el pedido se cree igual
      return false
    }
  }

  /**
   * Genera el HTML del email con diseño profesional
   */
  private generarHTMLEmail (
    pedido: any,
    lineas: any[],
    usuario: any,
    total: number
  ): string {
    // Generar las filas de productos
    const productosHTML = lineas
      .map((linea: any) => {
        const nombre = linea.nombre || linea.product?.nombre || 'Producto'
        const color = linea.color || 'N/A'
        const cantidad = linea.cant || linea.cantidad || 0
        const precio = linea.precio || linea.product?.precio || 0
        const subtotal = precio * cantidad

        return `
        <tr>
          <td>${nombre}</td>
          <td>${color}</td>
          <td>${cantidad}</td>
          <td>€${precio.toFixed(2)}</td>
          <td>€${subtotal.toFixed(2)}</td>
        </tr>
      `
      })
      .join('')

    // Formatear fecha
    const fecha = pedido.fecha
      ? new Date(pedido.fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('es-ES')

    // HTML del email
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Confirmación de Pedido</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">TatooDenda</h1>
          <h2 style="color: white; margin: 10px 0 0 0;">Confirmación de Pedido</h2>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">¡Hola ${usuario.nombre || 'Cliente'}!</p>
          <p style="font-size: 14px; color: #666;">Gracias por tu compra. Hemos recibido tu pedido correctamente y lo estamos procesando.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 10px 0;"><strong>Número de Pedido:</strong></td>
                <td style="text-align: right; color: #667eea;">#${
                  pedido.id
                }</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Fecha:</strong></td>
                <td style="text-align: right;">${fecha}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Total:</strong></td>
                <td style="text-align: right; font-size: 18px; color: #667eea;"><strong>€${total.toFixed(
                  2
                )}</strong></td>
              </tr>
            </table>
          </div>
          
          <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Detalle del Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; background-color: white;">
            <thead>
              <tr style="background-color: #667eea; color: white;">
                <th style="padding: 10px; text-align: left;">Producto</th>
                <th style="padding: 10px; text-align: left;">Color</th>
                <th style="padding: 10px; text-align: center;">Cant.</th>
                <th style="padding: 10px; text-align: right;">Precio</th>
                <th style="padding: 10px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <h3 style="color: #333; margin-top: 0;">Dirección de Envío</h3>
            <p style="margin: 5px 0;">${usuario.nombre || 'Cliente'}</p>
            <p style="margin: 5px 0;">${
              usuario.direccion || 'Dirección no especificada'
            }</p>
            <p style="margin: 5px 0;">${usuario.ciudad || 'Ciudad'}, ${
      usuario.cp || 'CP'
    }</p>
          </div>
          
          <div style="background-color: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #333;">📎 <strong>Albarán adjunto:</strong> Encontrarás el albarán detallado en formato PDF adjunto a este correo.</p>
          </div>
          
          <p style="text-align: center; color: #666; margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactarnos</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} TatooDenda - Todos los derechos reservados</p>
        </div>
      </body>
      </html>
    `
  }
}
