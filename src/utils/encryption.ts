import * as crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-cbc";

function getEncryptionKey(): Buffer {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required for encryption. Please set it in your .env file."
    );
  }
  return crypto.scryptSync(secret, "salt", 32);
}

let ENCRYPTION_KEY: Buffer | null = null;

function ensureEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    ENCRYPTION_KEY = getEncryptionKey();
  }
  return ENCRYPTION_KEY;
}

export function encrypt(text: string): { encrypted: string; iv: string } {
  const key = ensureEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex") };
}

export function decrypt(encrypted: string, iv: string): string {
  const key = ensureEncryptionKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

