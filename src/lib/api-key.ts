import crypto from "crypto";

/**
 * Gera uma API key segura no formato: flame_live_xxxxxxxxxxxxxxxxxxxx
 * ou flame_test_xxxxxxxxxxxxxxxxxxxx para ambientes de teste
 */
export function generateApiKey(prefix: "live" | "test" = "live"): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString("base64url");
  return `flame_${prefix}_${key}`;
}

/**
 * Valida o formato de uma API key
 */
export function isValidApiKeyFormat(key: string): boolean {
  return /^flame_(live|test)_[A-Za-z0-9_-]{43}$/.test(key);
}

/**
 * Hash de API key para armazenamento seguro
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
