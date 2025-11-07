export declare class PdfService {
    constructor();
    /** MÉTODO AUXILIAR: Agregar pie de página */
    private agregarPieDePagina;
    /** MÉTODO AUXILIAR: Agregar encabezado de tabla */
    private agregarEncabezadoTabla;
    /** Genera un albarán PDF y lo retorna como Buffer */
    generarAlbaranBuffer(pedido: any, lineas: any[], usuario?: any): Promise<Buffer>;
    private formatearFecha;
}
