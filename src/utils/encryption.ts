import * as crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = crypto.scryptSync(env.JWT_SECRET as string, "salt", 32);

export function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex") };
}

export function decrypt(encrypted: string, iv: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM!,
    ENCRYPTION_KEY!,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

