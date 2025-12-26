import { Request, Response } from "express";
/**
 * Liveness probe: returns 200 if service is running.
 */
export declare const livenessProbeController: (_req: Request, res: Response) => void;
/**
 * Readiness probe: checks dependencies (MongoDB, Redis).
 */
export declare const readinessProbeController: (_req: Request, res: Response) => Promise<void>;
declare const _default: {};
export default _default;
//# sourceMappingURL=health.d.ts.map