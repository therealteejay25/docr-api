import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const listRepos: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const connectRepo: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const disconnectRepo: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const getRepos: (req: AuthRequest, res: Response) => Promise<Response>;
export declare const updateRepoSettings: (req: AuthRequest, res: Response) => Promise<Response>;
//# sourceMappingURL=repos.controller.d.ts.map