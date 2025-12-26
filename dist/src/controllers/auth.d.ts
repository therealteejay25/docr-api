import { Request, Response } from "express";
export declare const redirectToGitHub: (_req: Request, res: Response) => Response | void;
export declare const gitHubCallback: (req: Request, res: Response) => Promise<Response | void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<Response>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map