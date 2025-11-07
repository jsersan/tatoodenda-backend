export declare const requestLogger: (req: any, res: any, next: any) => void;
declare const _default: {
    error: (message: string, meta?: any) => any;
    warn: (message: string, meta?: any) => any;
    info: (message: string, meta?: any) => any;
    debug: (message: string, meta?: any) => any;
    logError: (message: string, error: any) => any;
    auth: (message: string, user: string | number, meta?: any) => any;
};
export default _default;
