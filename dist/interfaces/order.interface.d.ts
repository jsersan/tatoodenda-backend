export interface IOrder {
    id?: number;
    iduser: number;
    fecha: string;
    total: number;
    lineas?: IOrderLine[];
}
export interface IOrderLine {
    id?: number;
    idpedido: number;
    idprod: number;
    color: string;
    cant: number;
    nombre?: string;
    precio: number;
}
export interface ICartItem {
    id: number;
    nombre: string;
    precio: number;
    color: string;
    cantidad: number;
    imagen: string;
}
export interface IOrderDetail extends IOrder {
    user?: {
        nombre: string;
        email: string;
    };
    lineas: Array<IOrderLine & {
        product?: {
            nombre: string;
            precio: number;
            imagen: string;
        };
    }>;
}
