import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const chatWithAgent: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const chatWithAgentStream: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAgentCapabilities: (req: AuthRequest, res: Response) => Promise<Response>;
//# sourceMappingURL=ai-agent.controller.d.ts.map