import { IOrder } from '../interfaces/order.interface';
export declare class OrderService {
    createOrder(orderData: any): Promise<any>;
    getOrdersByUserWithLines(userId: number): Promise<IOrder[]>;
    getOrderByIdWithLines(orderId: number): Promise<IOrder | null>;
    getOrderLines(orderId: number): Promise<any[]>;
    getUserData(userId: number): Promise<any | null>;
}
