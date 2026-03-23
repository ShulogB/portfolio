/**
 * URLs públicas configurables por entorno (GitHub, LinkedIn).
 * Definir NEXT_PUBLIC_GITHUB_URL y NEXT_PUBLIC_LINKEDIN_URL en .env (producción).
 */
export const GITHUB_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_GITHUB_URL?.trim()) ||
  "https://github.com";

export const LINKEDIN_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim()) ||
  "https://linkedin.com";
