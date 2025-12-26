export interface JWTPayload {
    userId: string;
    email: string;
}
export declare function generateAccessToken(payload: JWTPayload): string;
export declare function generateRefreshToken(payload: JWTPayload): string;
export declare function verifyAccessToken(token: string): JWTPayload;
export declare function verifyRefreshToken(token: string): JWTPayload;
//# sourceMappingURL=jwt.d.ts.map