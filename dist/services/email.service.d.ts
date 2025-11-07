export declare class EmailService {
    /**
     * Envía el albarán del pedido por email usando Resend
     */
    enviarAlbaran(pedido: any, lineas: any[], usuario: any, pdfBuffer: Buffer): Promise<boolean>;
    /**
     * Genera el HTML del email con diseño profesional
     */
    private generarHTMLEmail;
}
