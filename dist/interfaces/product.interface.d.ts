export interface IProduct {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria_id?: number;
    categoria?: number;
    imagen: string;
    carpetaimg?: string;
    imagePath?: string;
}
