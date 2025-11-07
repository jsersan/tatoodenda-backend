export interface ICategory {
    id?: number;
    nombre: string;
    padre: number;
}
export interface ICategoryFormData {
    id?: number;
    nombre: string;
    padre: number | string;
}
export interface ICategoryWithDetails extends ICategory {
    subcategories?: ICategory[];
    products?: number;
}
