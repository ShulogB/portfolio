/**
 * Borra la carpeta .next (caché de build). Uso: node scripts/clean-next.js
 * Evita chunks rotos (EADDRINUSE / OneDrive / mezcla dev+start).
 */
const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "..", ".next");
try {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("[clean-next] Eliminado:", nextDir);
} catch (e) {
  if (e.code !== "ENOENT") throw e;
  console.log("[clean-next] No existía .next, OK.");
}
