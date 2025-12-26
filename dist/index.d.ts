import http from "http";
import "./src/workers";
declare const app: import("express-serve-static-core").Express;
declare const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export declare let ngrokUrl: string | null;
export { app, server };
//# sourceMappingURL=index.d.ts.map