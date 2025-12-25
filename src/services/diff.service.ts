import { diffLines, type Change } from "diff";
import { logger } from "../lib/logger";

export interface Patch {
  file: string;
  unifiedDiff: string;
  changes: Change[];
  isSafe: boolean;
}

export class DiffService {
  /**
   * Apply a unified diff patch to existing content
   */
  applyPatch(originalContent: string, patch: string): string {
    try {
      // Parse unified diff format
      const lines = patch.split("\n");
      const result: string[] = [];
      let originalLines = originalContent.split("\n");
      let originalIndex = 0;
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];

        // Skip header lines
        if (line.startsWith("---") || line.startsWith("+++") || line.startsWith("@@")) {
          i++;
          continue;
        }

        // Context line (unchanged)
        if (line.startsWith(" ") && originalIndex < originalLines.length) {
          result.push(originalLines[originalIndex]);
          originalIndex++;
          i++;
        }
        // Deletion line
        else if (line.startsWith("-")) {
          originalIndex++;
          i++;
        }
        // Addition line
        else if (line.startsWith("+")) {
          result.push(line.substring(1));
          i++;
        }
        // Regular line (fallback)
        else {
          if (originalIndex < originalLines.length) {
            result.push(originalLines[originalIndex]);
            originalIndex++;
          }
          i++;
        }
      }

      // Add remaining original lines
      while (originalIndex < originalLines.length) {
        result.push(originalLines[originalIndex]);
        originalIndex++;
      }

      return result.join("\n");
    } catch (error: any) {
      logger.error("Failed to apply patch", { error: error.message, patch });
      throw new Error(`Patch application failed: ${error.message}`);
    }
  }

  /**
   * Generate unified diff between two strings
   */
  generateDiff(oldContent: string, newContent: string, filePath: string): string {
    const changes = diffLines(oldContent, newContent);
    let diff = `--- a/${filePath}\n+++ b/${filePath}\n`;
    let oldLineNum = 1;
    let newLineNum = 1;
    let hunkStart = 1;
    let hunkOldLines = 0;
    let hunkNewLines = 0;
    const hunkLines: string[] = [];

    for (const change of changes) {
      if (change.added || change.removed) {
        if (hunkLines.length === 0) {
          hunkStart = change.removed ? oldLineNum : newLineNum;
        }
      }

      if (change.removed) {
        hunkLines.push(`-${change.value.replace(/\n$/, "")}`);
        hunkOldLines += change.count || 1;
        oldLineNum += change.count || 1;
      } else if (change.added) {
        hunkLines.push(`+${change.value.replace(/\n$/, "")}`);
        hunkNewLines += change.count || 1;
        newLineNum += change.count || 1;
      } else {
        if (hunkLines.length > 0) {
          diff += `@@ -${hunkStart},${hunkOldLines} +${hunkStart},${hunkNewLines} @@\n`;
          diff += hunkLines.join("\n") + "\n";
          hunkLines.length = 0;
          hunkOldLines = 0;
          hunkNewLines = 0;
        }
        hunkStart = oldLineNum;
        oldLineNum += change.count || 1;
        newLineNum += change.count || 1;
      }
    }

    if (hunkLines.length > 0) {
      diff += `@@ -${hunkStart},${hunkOldLines} +${hunkStart},${hunkNewLines} @@\n`;
      diff += hunkLines.join("\n") + "\n";
    }

    return diff;
  }

  /**
   * Validate patch safety - check for destructive patterns
   */
  validatePatchSafety(patch: string, originalContent: string): boolean {
    const lines = patch.split("\n");
    const deletions = lines.filter((l) => l.startsWith("-")).length;
    const additions = lines.filter((l) => l.startsWith("+")).length;
    const originalLines = originalContent.split("\n").length;

    // Safety checks
    // 1. Don't delete more than 50% of content
    if (deletions > originalLines * 0.5) {
      logger.warn("Patch deletes too much content", { deletions, originalLines });
      return false;
    }

    // 2. Check for suspicious patterns
    const suspiciousPatterns = [
      /delete.*all/i,
      /remove.*everything/i,
      /clear.*all/i,
      /wipe.*out/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(patch)) {
        logger.warn("Suspicious pattern detected in patch", { pattern });
        return false;
      }
    }

    return true;
  }

  /**
   * Merge multiple patches into one
   */
  mergePatches(patches: Patch[]): string {
    return patches.map((p) => p.unifiedDiff).join("\n\n");
  }

  /**
   * Detect existing sections in content
   */
  detectSections(content: string): Array<{ title: string; start: number; end: number }> {
    const sections: Array<{ title: string; start: number; end: number }> = [];
    const lines = content.split("\n");
    let currentSection: { title: string; start: number; end: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Detect markdown headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        if (currentSection) {
          currentSection.end = i - 1;
          sections.push(currentSection);
        }
        currentSection = {
          title: headerMatch[2],
          start: i,
          end: lines.length - 1,
        };
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }
}

export const diffService = new DiffService();

