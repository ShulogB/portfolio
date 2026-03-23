/**
 * Base URL del backend (Django). En producción definir NEXT_PUBLIC_API_URL.
 */
const base = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000";
export const API_BASE = base.replace(/\/$/, "");

/** URL del login del admin (Django). Para enlace "Admin" en el footer. */
export const ADMIN_LOGIN_URL = `${API_BASE}/admin/`;

export const API_ENDPOINTS = {
  contact: `${API_BASE}/api/v1/contact/`,
  track: `${API_BASE}/api/v1/track/`,
  caseStudies: `${API_BASE}/api/v1/case-studies/`,
} as const;
