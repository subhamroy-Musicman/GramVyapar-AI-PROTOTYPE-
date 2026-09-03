export const AI_CONFIG = {
  provider: "GEMINI",
  model: "gemini-3.6-flash",
  temperature: 0.1, // Low temperature for deterministic/factual explanation
  schemaVersion: "advisory-v1",
  promptVersion: "advisory-v1",
} as const;
