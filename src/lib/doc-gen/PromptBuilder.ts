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
    projectDescription?: string;
  };
}

export class PromptBuilder {
  buildSystemPrompt(): string {
    return `
You are an assistant that MUST return strictly valid JSON.
Do NOT include markdown, explanations, or extra text.

The JSON must match EXACTLY this shape:

{
  "patches": [{ "file": "string", "patch": "string", "reason": "string" }],
  "summary": "string",
  "coverageScore": 0.0,
  "structuredDoc": {
    "sections": [{ "title": "string", "content": "string", "type": "string" }]
  }
}

Rules:
- "patches" MUST exist and contain at least one item.
- If unsure, generate a README.md patch.
- Output ONLY JSON.

Additional guidance for comprehensive project documentation generation:
- Use any files provided in 'projectAnalysis.mainFiles' to understand code structure, APIs, components, and important files.
- Produce documentation that covers: project overview, setup (install & run), architecture, key modules/components, public APIs/endpoints, examples, configuration, and contribution guidelines.
- For large projects, prefer concise, well-structured sections and add pointers to important source files (path references) instead of copying entire source code into docs.
- Provide sensible file assignments: README.md for general docs, API_DOCS.md for API reference, ARCHITECTURE.md for architecture, and CHANGELOG.md for release notes when applicable.
- When creating patches, ensure they are idempotent (won't duplicate content if applied twice) and include a clear 'reason' explaining the change.

Respect the JSON shape above and do not include non-JSON text.
`.trim();
  }

  buildUserPrompt(input: DocGenerationInput): string {
    const name =
      input.projectAnalysis?.packageJson?.name ||
      input.repoContext.name ||
      "Project";

    const description =
      input.projectAnalysis?.projectDescription || "A software project";

    return `
Generate documentation updates for the project "${name}".

Context:
- Commit message: ${input.commitMessage}
- Changed files: ${input.fileDiffs.map((f) => f.path).join(", ")}
- Project description: ${description}
- Existing README: ${Boolean(input.existingDocs.readme)}

Return valid JSON matching the required schema.
`.trim();
  }
}
