import { type Change } from "diff";
export interface Patch {
    file: string;
    unifiedDiff: string;
    changes: Change[];
    isSafe: boolean;
}
export declare class DiffService {
    /**
     * Apply a unified diff patch to existing content
     */
    applyPatch(originalContent: string, patch: string): string;
    /**
     * Generate unified diff between two strings
     */
    generateDiff(oldContent: string, newContent: string, filePath: string): string;
    /**
     * Validate patch safety - check for destructive patterns
     */
    validatePatchSafety(patch: string, originalContent: string): boolean;
    /**
     * Merge multiple patches into one
     */
    mergePatches(patches: Patch[]): string;
    /**
     * Detect existing sections in content
     */
    detectSections(content: string): Array<{
        title: string;
        start: number;
        end: number;
    }>;
}
export declare const diffService: DiffService;
//# sourceMappingURL=diff.service.d.ts.map