import { Request, Response, NextFunction } from "express";
/**
 * Request logging middleware: adds correlation ID and logs request/response.
 */
export declare const requestLoggingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    requestLoggingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=logging.d.ts.map