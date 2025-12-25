import OpenAI from "openai";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import fs from "fs";
import path from "path";

/* =======================
   Types
======================= */

export interface DocGenerationInput {
  fileDiffs: Array<{
    path: string;
    diff: string;
    status: "added" | "modified" | "deleted" | string;
  }>;
  commitMessage: string;
  repoContext: {
    name: string;
    language: string;
    structure: string[];
  };
  existingDocs: {
    readme?: string;
    changelog?: string;
    apiDocs?: string;
  };
  projectAnalysis?: {
    packageJson?: any;
    mainFiles?: Array<{ path: string; content: string }>;
    codeSnippets?: string;
    projectDescription?: string;
  };
}

export interface DocGenerationOutput {
  patches: Array<{ file: string; patch: string; reason: string }>;
  summary: string;
  coverageScore: number;
  structuredDoc: {
    sections: Array<{ title: string; content: string; type: string }>;
  };
}

/* =======================
   Validation
======================= */

function isValidDocOutput(o: any): o is DocGenerationOutput {
  return (
    o &&
    Array.isArray(o.patches) &&
    o.patches.every(
      (p: any) =>
        typeof p.file === "string" &&
        typeof p.patch === "string" &&
        typeof p.reason === "string"
    ) &&
    typeof o.summary === "string" &&
    typeof o.coverageScore === "number" &&
    o.structuredDoc &&
    Array.isArray(o.structuredDoc.sections)
  );
}

/* =======================
   Service
======================= */

export class AIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_KEY,
      baseURL: env.OPENAI_API_BASE || "https://openrouter.ai/api/v1",
    } as any);
  }

  /**
   * Generic completion method that returns parsed JSON
   */
  public async generateCompletion(
    messages: any[],
    model: string = "google/gemini-2.0-flash-001"
  ): Promise<any> {
    try {
      logger.info("Generating AI completion", { model });

      const response = await this.client.chat.completions.create({
        model,
        temperature: 0,
        max_tokens: 8000,
        response_format: { type: "json_object" },
        messages,
      } as any);

      // Extract content
      let rawContentStr = "";
      const choice = response?.choices?.[0];
      if (choice?.message?.content) {
        rawContentStr = choice.message.content as string;
      } else {
        throw new Error("No content in AI response");
      }

      // Log raw response for debugging
      console.log("=== AI RESPONSE START ===");
      console.log("Response length:", rawContentStr.length);
      console.log("Raw AI Response:", rawContentStr);
      console.log("=== AI RESPONSE END ===");
      
      this.logRawResponse(rawContentStr);

      // Parse JSON
      return this.parseJsonSafely(rawContentStr);
    } catch (err: any) {
      // Re-enable console logging for debugging
      console.error("AI Service Error:", err);
      if (err.response) {
        console.error("AI Service Error Response:", err.response.data);
      }
      
      logger.error("AI completion failed", { 
        error: err.message,
        name: err.name,
        stack: err.stack,
        code: err.code,
        status: err.status,
      });
      throw err;
    }
  }

  private parseJsonSafely(jsonStr: string): any {
    try {
      // 1. Try direct parse
      return JSON.parse(jsonStr);
    } catch (e) {
      // 2. Try unwrap double encoding
      try {
        const inner = JSON.parse(jsonStr);
        if (typeof inner === "string") return JSON.parse(inner);
      } catch (_) {
        // ignore
      }

      // 3. Try to extract from markdown fences
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch (_) {
          // ignore
        }
      }

      throw new Error("Failed to parse AI JSON response");
    }
  }

  private logRawResponse(content: string) {
    try {
      const logsDir = path.join(process.cwd(), "logs", "ai-responses");
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
      fs.writeFileSync(
        path.join(logsDir, `${Date.now()}-ai-response.json`),
        content,
        "utf-8"
      );
    } catch (e) {
      // ignore logging errors
    }
  }

  // Maintaining old method for backward compatibility if any other services use it, 
  // but mapped to new flow ideally. 
  // For this refactor we assume we can remove specific logic or keep it minimal.
  // I will comment it out to force usage of new system or simple keep it if needed.
  // The user asked to "modify the logic", so I will remove the specific generateDocumentation method logic 
  // and make it use the generic one if I needed to keep the signature, 
  // BUT the plan says "expose a simple generateCompletion", implying replacing the old specific one.
}

export const aiService = new AIService();
