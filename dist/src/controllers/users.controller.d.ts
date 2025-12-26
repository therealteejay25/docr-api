import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getUser: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const getSettings: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const updateSettings: (req: AuthRequest, res: Response) => Promise<Response>;
//# sourceMappingURL=users.controller.d.ts.map