/**
 * Contenido estático de cada proyecto (página /projects/[slug]).
 * Para cambiar la URL del botón "Ver sitio en vivo": editar el campo `externalUrl` de cada proyecto más abajo.
 * Si no hay sitio en vivo, dejar `externalUrl: "#"` y el botón no se mostrará.
 */
import type { ScaleConstraints, RejectedApproach, AdrLink } from "./content";

export type ProjectSlug = "patagonia-dreams" | "municipal-identity" | "payment-orchestrator";

export type DeepDiveSection = { title: string; paragraphs: string[] };

export type Project = {
  slug: ProjectSlug;
  title: string;
  tech: string;
  overview: string;
  diagramType: "payments" | "identity";
  adrs: AdrLink[];
  scaleConstraints: ScaleConstraints;
  rejectedApproaches: RejectedApproach[];
  whatWouldBreak: string[];
  deepDive: DeepDiveSection[];
  /** URL del sitio en vivo; usar "#" o vacío si no hay. El botón "View live site" solo se muestra si es una URL real. */
  externalUrl: string;
  asciiDiagram?: string;
  /** Traducciones opcionales; cuando lang=es se usan si existen, si no no se muestra el bloque o se usa EN. */
  titleEs?: string;
  techEs?: string;
  overviewEs?: string;
};

const patagoniaDreams: Project = {
  slug: "patagonia-dreams",
  title: "Transactional Booking & Payment Platform",
  tech: "Payments • Webhooks • Concurrency",
  overview:
    "Backend for Patagonia Dreams: identity via AWS Cognito with token verification and SECRET_HASH; transactional payment and booking flows; safe export (JSON instead of CSV to avoid formula injection); URL sanitization in emails; secrets in AWS Secrets Manager; CI/CD pipeline with SAST (Semgrep) and secret scanning (Gitleaks). Tourism reservation platform in production. Multi-module, multi-tenant backoffice (partners and end customers). Payments via Mercado Pago, Stripe, Pix; webhooks as single source of truth for \"reservation paid,\" with HMAC validation and idempotency by event_id. Stack: Django, DRF, PostgreSQL, AWS (SES, Cognito, ECR/K8s), external Panel and payment gateways.",
  diagramType: "payments",
  adrs: [
    { title: "Use webhooks as single source of truth for payment status", href: "#" },
    { title: "Idempotency keys on reservation creation and event_id on webhooks", href: "#" },
    { title: "Pessimistic locking (SELECT FOR UPDATE) for availability", href: "#" },
    { title: "Modular monolith with explicit domain boundaries", href: "#" },
    { title: "HMAC validation for all incoming webhook payloads", href: "#" },
    { title: "AWS Cognito as single identity entry; ID token verification with JWKS before trusting user data", href: "#" },
    { title: "SECRET_HASH in all Cognito calls that require it (sign_up, confirm_sign_up, authenticate, refresh_token)", href: "#" },
    { title: "JSON export instead of CSV to avoid Excel/CSV formula injection; URL validation (http_url) in email templates", href: "#" },
    { title: "Critical config (Cognito, Stripe, Panel, etc.) via env from AWS Secrets Manager; no secrets in repo", href: "#" },
    { title: "CI/CD: Semgrep (SAST), Gitleaks, pip-audit, Trivy (Docker); no direct push to production branch", href: "#" },
  ],
  scaleConstraints: {
    requestVolume: "~2k reservations/month; webhook bursts up to ~50/min on peak.",
    concurrency: "Pessimistic lock on availability row per slot; single writer for payment state. No cross-slot locking.",
    externalDependencies: "Mercado Pago, Stripe, Pix; AWS Cognito, SES; external Panel (activities, rates, blocks). Webhooks are async; payment status only via webhook.",
    failureModes: "Provider timeout or webhook delay → reservation stays pending until webhook or manual reconciliation. Duplicate webhook → idempotent by event_id. Cognito/Panel down → degraded auth or catalog sync.",
    dataConsistency: "Single DB transaction for reservation + payment on webhook. Reservation \"paid\" only after webhook; frontend cannot set paid. Cognito ↔ Django user sync via get_or_create and ID token verification.",
  },
  rejectedApproaches: [
    { approach: "Frontend or redirect callback as source of \"paid\"", reason: "Redirects and client state are unreliable; provider retries and multiple tabs would allow double-apply or missed updates." },
    { approach: "Optimistic locking on availability", reason: "Conflict rate on hot slots would cause high retry and poor UX; pessimistic lock gave predictable behaviour at observed load." },
    { approach: "Microservices per domain (payments, reservations, catalog)", reason: "Operational and consistency cost (distributed transactions, eventual consistency) not justified for current scale; modular monolith with clear boundaries chosen instead." },
    { approach: "CSV export for operations", reason: "Excel/CSV formula injection risk; replaced with JSON response and controlled data only." },
    { approach: "Secrets or sensitive URLs in code or repo", reason: "All critical config (FRONTEND_URL, Cognito, Stripe, Panel, etc.) via env from AWS Secrets Manager." },
  ],
  whatWouldBreak: [
    "Single DB or replica failure: all reservations and payment state in one store; no automatic failover.",
    "Webhook delivery stopped (provider or our endpoint): reservations stay pending indefinitely; no path to \"paid\".",
    "Lock contention on hot slots: SELECT FOR UPDATE serializes; at higher concurrency wait times and timeouts grow.",
    "Idempotency key table unbounded growth: cleanup fails or is delayed → table bloat and slower lookups.",
    "Mercado Pago, Stripe, and Pix all degraded: no path to confirm payment; business stops.",
    "Catalog sync provider wrong or down: stale inventory; overbooking if external availability is authoritative.",
    "Cognito unavailable: no signup/login or token refresh; identity is single point of entry.",
    "Secrets Manager or env misconfiguration: auth or payment integrations fail at runtime.",
  ],
  deepDive: [
    {
      title: "Identity & auth (trust boundaries)",
      paragraphs: [
        "AWS Cognito is the single entry point for identity: signup, email confirmation, login with user/password, token refresh, and OAuth Authorization Code callback for Hosted UI.",
        "Bidirectional sync Cognito ↔ Django user: get_or_create by email, unique username generation on collision, update of names and active status from verified ID token (JWKS, issuer, audience, exp). SECRET_HASH is used correctly in all Cognito calls that require it (sign_up, confirm_sign_up, authenticate, refresh_token) for confidential clients, avoiding production config errors.",
        "ID token is verified with JWKS (RS256, issuer, audience) before trusting any user data; without verification we do not create or update the local user.",
      ],
    },
    {
      title: "Payment and transactional flows",
      paragraphs: [
        "Payment and booking confirmation flows: transactional emails (AWS SES) with booking data, passengers, activities, and secure links; templates parameterized only with controlled context (booking, activities).",
        "Integration with external Panel (activities, rates, blocks) and mapping Panel activity ↔ local activity, with data export for operations and reporting.",
        "Atomic transactions (transaction.atomic()) on reservation creation/update and mappings to keep consistency under failures or concurrency.",
      ],
    },
    {
      title: "Security and trust boundaries",
      paragraphs: [
        "Injection vectors removed: CSV export replaced by JSON response to avoid Excel/CSV formula injection; URL validation in email templates (http_url filter: only http/https) to prevent XSS via javascript: in href.",
        "Secrets out of code: critical config (FRONTEND_URL, WHATSAPP_NUMBER, social URLs, Cognito, Stripe, Panel, etc.) via environment variables from AWS Secrets Manager; no sensitive values in repo.",
        "CI/CD and security: pipeline with Semgrep (SAST), Gitleaks, pip-audit, Trivy (Docker image); no direct push to production branch; migration and dependency review before deploy.",
      ],
    },
    {
      title: "Concurrency and correctness",
      paragraphs: [
        "Idempotency and uniqueness: get_or_create and \"single record\" logic (e.g. Layouts, mappings) to avoid duplicates and race conditions on writes.",
        "Explicit transactions in flows that touch multiple models (reservation + user + notifications) to guarantee all-or-nothing and consistency on failure.",
        "Integration with external APIs (Panel, Cognito) with timeouts and error handling so the process does not block and we do not trust malformed responses.",
      ],
    },
    {
      title: "Idempotency in distributed payments",
      paragraphs: [
        "Payment providers and webhooks deliver at least once. Retries, network partitions, and client double-submits make duplicate events the norm. Idempotency is implemented at two distinct layers: client-initiated operations (e.g. reservation creation) and server-driven events (webhooks).",
        "For client operations we use an idempotency key (supplied by the client or derived from a deterministic hash of intent). The key is the sole lookup for the stored outcome; the first request executes and persists the result, subsequent requests return the stored result without re-executing. Key design: store outcome (success/failure + response payload or error code), not just \"seen\". That allows safe replay with correct semantics.",
        "For webhooks we key on event_id (or provider-side id). The same event_id may be delivered multiple times; we apply the state transition once and ignore duplicates. Critical: the idempotency check and the state update (e.g. mark reservation paid) live in the same transaction so we never double-apply under concurrency. Key expiry and cleanup policies prevent unbounded growth while retaining keys long enough to cover provider retry windows (e.g. 24–72h).",
      ],
    },
    {
      title: "Atomic state transitions and race conditions",
      paragraphs: [
        "Double-booking occurs when two concurrent requests both read \"available\" and then both commit a booking. The fix is a single writer and serialisation at the consistency boundary. We use SELECT FOR UPDATE on the availability row (or the aggregate that owns it) inside the same transaction that creates the reservation. The second request blocks until the first commits or rolls back; it then sees updated state and either succeeds on remaining capacity or fails consistently.",
        "When the transition spans two stores (e.g. payment record and reservation), we keep them in one DB transaction where both tables live in the same database. Commit creates the payment row and updates the reservation in one atomic step. When payment is external (provider webhook), we do not have a single distributed transaction—we treat the webhook as the source of truth for \"paid\" and update our reservation in one local transaction keyed by idempotent event_id; the only writer for that transition is the webhook handler.",
        "We avoid saga-style compensating transactions for the core path: they add complexity and new failure modes. Where we must coordinate across services, we use an outbox or single write that triggers downstream work, with idempotent consumers so duplicate events do not double-apply.",
      ],
    },
  ],
  externalUrl: "https://patagoniadreams.com.ar",
  titleEs: "Plataforma transaccional de reservas y pagos",
  techEs: "Pagos • Webhooks • Concurrencia",
  overviewEs:
    "Backend en Patagonia Dreams: identidad vía Cognito con verificación de tokens y SECRET_HASH; flujos de pago y reservas transaccionales; export seguro (JSON); sanitización de URLs en emails; secrets en AWS Secrets Manager; pipeline CI/CD con SAST y escaneo de secretos. Plataforma de reservas turísticas en producción. Backoffice multi-módulo, multi-tenant (socios y clientes finales). Pagos vía Mercado Pago, Stripe, Pix; webhooks como única fuente de verdad de \"reserva pagada\", con validación HMAC e idempotencia por event_id. Stack: Django, DRF, PostgreSQL, AWS (SES, Cognito, ECR/K8s), Panel externo y pasarelas de pago.",
};

const municipalIdentity: Project = {
  slug: "municipal-identity",
  title: "Municipal Unified Identity Platform",
  tech: "Identity • Trust Boundaries • RBAC",
  overview:
    "Centralized authentication gateway for a municipality: citizens authenticate once and access multiple government services with a single token. Identity is validated against national registries (Mi Argentina, RENAPER, AFIP) on every login; the gateway is the only component that calls those APIs and the only issuer of session tokens. Legacy systems consume signed tokens and enforce RBAC; they do not re-authenticate. No PII in tokens; fail safe when national APIs are unavailable. Audit and RBAC at gateway and service layer.",
  diagramType: "identity",
  adrs: [
    { title: "Gateway as sole issuer of session tokens; legacy systems validate only", href: "#" },
    { title: "No PII in tokens; minimal claims for authorization", href: "#" },
    { title: "Fail safe when national identity APIs are unavailable", href: "#" },
    { title: "RBAC enforced at gateway and at service layer", href: "#" },
    { title: "Audit logging for authentication and token issuance", href: "#" },
  ],
  scaleConstraints: {
    requestVolume: "~45k logins/month; token validation on every request to downstream services.",
    concurrency: "Gateway is single writer for tokens; services are read-only validators. No distributed lock; stateless validation.",
    externalDependencies: "Mi Argentina, RENAPER, AFIP. Login depends on at least one being available; degraded mode (unverified session or reject) when all are down.",
    failureModes: "National APIs down or slow → degraded mode or login failure; no \"verified\" issued without verification. Token validation failure → 401; no fallback to legacy auth.",
    dataConsistency: "Session and verification state only in gateway; tokens are signed assertions. Services do not persist identity state; they validate and apply RBAC per request.",
  },
  rejectedApproaches: [
    { approach: "Each legacy system calling national APIs and issuing its own tokens", reason: "Would duplicate integration, PII exposure, and failure modes; single gateway gives one trust boundary and one place to fail safe." },
    { approach: "PII or raw registry data in tokens", reason: "Blast radius and compliance; tokens are minimal claims (sub, roles, exp) so compromise of a service does not leak registry data." },
    { approach: "Long-lived tokens with no re-validation", reason: "Verification must reflect current state; every login re-validates against national APIs so \"verified\" cannot become stale." },
  ],
  whatWouldBreak: [
    "Gateway down: no one logs in; single point of failure for all services.",
    "RENAPER, AFIP, Mi Argentina all unavailable: only unverified sessions or login failure; no degradation that preserves \"verified\".",
    "Token signing key compromise: all tokens forgeable until rotation; services must reject old key and all sessions invalidated.",
    "DB holding session/audit state lost: session revocation and audit trail gap; no point-in-time recovery of who had access.",
    "Sudden 10x login spike: national APIs and gateway become bottleneck; external dependencies do not scale with us.",
    "Legacy service skips RBAC or misvalidates token: authorization bypass; boundary is only as strong as the weakest consumer.",
  ],
  deepDive: [
    {
      title: "Token design and trust boundaries",
      paragraphs: [
        "The gateway is the only component that calls identity providers (national APIs, etc.) and the only issuer of session tokens. Downstream services validate tokens and enforce RBAC; they never re-authenticate. That defines a clear trust boundary: everything behind the gateway trusts the gateway's issuance and treats the token as the authority for identity and claims.",
        "Tokens carry minimal claims: identity id, roles, scope, expiry. No PII, no raw registry data. That limits blast radius on token leak and keeps compliance boundaries clear (PII stays in the system that owns it). We use signed tokens (e.g. JWT with HMAC or asymmetric signing); validators verify signature and expiry and reject anything else. Opaque tokens with a server-side lookup are an alternative when revocation must be immediate and global.",
        "Revocation is handled at the gateway (session invalidation, logout). Downstream services rely on short-lived tokens or periodic re-validation if strict \"logout everywhere\" is required without a shared revocation store.",
      ],
    },
    {
      title: "Audit logging strategy",
      paragraphs: [
        "We log state-changing actions with who (actor id or service), what (action type, resource id), when (timestamp), and enough context to reproduce (e.g. idempotency key, event_id, id of created/updated entity). Logs are append-only and immutable; no in-place edits. That supports compliance and post-incident analysis.",
        "Structured fields (JSON or key-value) allow querying by correlation_id, request_id, or user_id. Correlation IDs are propagated across service boundaries so a single payment or login can be traced from gateway through to DB write. Retention is policy-driven: short for noisy debug logs, longer for audit and payment-related events.",
        "Sensitive data is not logged in plain text; we log identifiers and event types, not full PII or card data. Audit logs are written synchronously in the critical path so we do not lose events on crash; we keep the payload small and the write fast (e.g. to a dedicated table or log stream).",
      ],
    },
    {
      title: "Observability and failure detection",
      paragraphs: [
        "Health checks are split: liveness (process up) vs readiness (dependencies acceptable). A service that cannot reach the DB or an identity provider should fail readiness so the orchestrator does not send traffic until it recovers. We avoid marking healthy when we cannot fulfill requests.",
        "We instrument payment and identity flows with metrics: latency (p50/p99), error rate by outcome (e.g. success, idempotent duplicate, validation failure), and idempotency hit rate. Alerts fire on elevated error rate, dependency failures (e.g. national API down), and payment webhook processing failures. Dashboards show success vs duplicate vs failure so we can distinguish retries from real regressions.",
        "Distributed tracing (trace_id across services) ties a request from API through queue and DB. When a payment or login fails, we can follow the same trace_id in logs and traces. Failure detection is not only \"service down\" but \"succeeding with degraded semantics\"—e.g. we alert when we cannot verify identity and are serving unverified sessions, so the decision to degrade is explicit and visible.",
      ],
    },
  ],
  externalUrl: "https://autentica.bahia.gob.ar",
  titleEs: "Plataforma municipal de identidad unificada",
  techEs: "Identidad • Límites de confianza • RBAC",
  overviewEs:
    "Gateway de autenticación centralizado para un municipio: los ciudadanos se autentican una vez y acceden a múltiples servicios gubernamentales con un único token. La identidad se valida contra registros nacionales (Mi Argentina, RENAPER, AFIP) en cada login; el gateway es el único componente que llama esas APIs y el único emisor de tokens de sesión. Sistemas legacy consumen tokens firmados y aplican RBAC; no re-autentican. Sin PII en tokens; fail safe cuando las APIs nacionales no están disponibles. Auditoría y RBAC en gateway y capa de servicio.",
};

const PAYMENT_ORCHESTRATOR_ASCII = `Client
   ↓
API (Django)
   ↓
PostgreSQL (transactions + idempotency)
   ↓
Outbox Table
   ↓
Worker (Celery)
   ↓
Payment Provider`;

const paymentOrchestrator: Project = {
  slug: "payment-orchestrator",
  title: "Idempotent Payment Orchestrator",
  tech: "Backend Architecture • Transactional Systems",
  asciiDiagram: PAYMENT_ORCHESTRATOR_ASCII,
  overview:
    "Designed and implemented a retry-safe payment processing pipeline with strict idempotency guarantees under concurrent transaction submissions. Idempotency keys at request boundary; outbox for provider calls; webhook reconciliation by event_id. Guarantee: no double charge under client retries, duplicate webhooks, or network failure between DB commit and provider call.",
  diagramType: "payments",
  adrs: [
    { title: "Idempotency key required for all payment initiation requests", href: "#" },
    { title: "Outbox for provider calls; no side effects inside request lifecycle", href: "#" },
    { title: "Webhook processing idempotent by provider event_id", href: "#" },
    { title: "Transaction boundaries: single DB transaction per state transition", href: "#" },
    { title: "Reconciliation and failure mode handling", href: "#" },
  ],
  scaleConstraints: {
    requestVolume: "Client and provider retries; requests and webhooks can arrive duplicated or out of order.",
    concurrency: "Single writer per idempotency key; outbox for provider calls. No double charge under retries.",
    externalDependencies: "Payment provider API; webhooks. Network failures between DB commit and provider call possible.",
    failureModes: "Provider timeout or unreachable after commit → outbox retry. Duplicate webhook → idempotent by event_id. Client retry → same key returns stored outcome.",
    dataConsistency: "Payment state and outbox in same DB; commit before provider call or outbox. No double charge; idempotency key is sole source of outcome for request.",
  },
  rejectedApproaches: [
    { approach: "Simple request-based processing without idempotency keys", reason: "Retries and duplicate submissions would cause double charge; key at business layer is required." },
    { approach: "Handling retries only at HTTP layer", reason: "Application state can still double-apply; idempotency must be enforced at orchestration layer with a stable key." },
    { approach: "Relying entirely on provider guarantees", reason: "Provider semantics vary and may not guarantee exactly-once; we own the no-double-charge guarantee." },
    { approach: "Processing side effects inside request lifecycle", reason: "If process dies after DB commit but before provider call, state is inconsistent; outbox decouples and allows retry without re-executing request." },
  ],
  whatWouldBreak: [
    "Outbox worker stopped: payments committed in DB never reach provider; state stuck, money never charged.",
    "Provider accepts charge but never sends webhook: we may never mark succeeded; reconciliation depends on manual or batch check.",
    "Idempotency key reused for different intents: wrong outcome returned; key must be per intent.",
    "Provider eventually consistent: we mark paid on webhook; provider may still show pending; read-your-writes violation for downstream.",
    "Worker retries outbox row without provider idempotency: double charge if provider does not deduplicate by our key.",
  ],
  deepDive: [
    {
      title: "Idempotency Strategy",
      paragraphs: [
        "Every payment initiation request must carry an idempotency key (client-supplied or derived from intent). The key is the sole lookup for the stored outcome. First request with a given key creates the payment row and runs the state machine; subsequent requests with the same key return the stored outcome without re-executing. We store outcome (success/failure plus response or error code), not just \"seen\", so replay returns the same result.",
        "A unique constraint on (client_id, idempotency_key) in the database enforces one row per key. Concurrent requests with the same key: one inserts and proceeds; others hit the constraint and either retry the read or treat as duplicate. No application-level lock required; the constraint is the serialisation point.",
        "Payment state is a status-based state machine (e.g. pending → charge_requested → provider_called → succeeded, or failed). Transitions are deterministic and stored in one transaction. Same key always yields same terminal state; we never transition from failed to succeeded or create a second charge.",
      ],
    },
    {
      title: "Transaction Boundaries",
      paragraphs: [
        "Each state transition is one atomic database transaction. We insert or update the payment row and, when we need to call the provider, insert an outbox row in the same transaction. Commit happens before any HTTP call to the provider. If we committed and then called the provider in the same process, a crash after commit but before the call would leave our DB updated but the provider never called; the outbox row ensures a background worker will perform the call later.",
        "The external provider call must be outside the commit because the provider is not part of the transaction. We cannot roll back a provider charge if our commit fails. So we never do: commit then call provider in request. We do: commit (state + outbox row) then return; worker calls provider and updates state in a separate transaction.",
        "Double execution is prevented by the idempotency key at the request boundary (same key → same stored outcome) and by the unique constraint (one row per key). The worker dispatches each outbox row at most once in practice; if it retries, the provider call uses the same idempotency key so the provider does not double-charge.",
      ],
    },
    {
      title: "Outbox Pattern Implementation",
      paragraphs: [
        "We use a dedicated outbox table: columns include id, payment_id, payload, status (pending/processed/failed), created_at, processed_at. When we transition payment to \"charge requested\", we insert a row into the outbox in the same transaction. No other side effects run in that request.",
        "A background worker polls the outbox for pending rows (or is notified by a queue). It loads the row, calls the payment provider with the payload and idempotency key, and on success marks the row processed and updates the payment state in one transaction. On provider failure or timeout it leaves the row pending and retries with backoff.",
        "We do not guarantee that the provider is called in the same second as the commit; we guarantee that every committed outbox row is eventually processed. The worker retries until the provider accepts or we mark failed after a threshold. Local state (payment + outbox) is consistent after each transaction; provider state catches up when the worker succeeds. That is eventual consistency between our DB and the provider.",
      ],
    },
    {
      title: "Webhook Reconciliation",
      paragraphs: [
        "We persist every webhook event in a table keyed by provider event_id (or equivalent). Before applying any transition we check whether that event_id is already stored; if so we skip (deduplicate). If not we apply the transition (e.g. payment succeeded) and store the event_id in the same transaction. Duplicate webhooks for the same event_id are no-ops.",
        "Deduplication is by provider event_id only. We do not key by our internal id; the provider can send the same event multiple times. First occurrence wins; later ones are ignored. Order of arrival does not change the outcome because the state machine is deterministic and we only move forward (e.g. pending → succeeded; we never overwrite succeeded with failed).",
        "We reconcile webhook-derived state with the local state machine. If the worker already updated state from a successful provider call, the webhook may be redundant; we still store the event_id and treat as idempotent duplicate. If the webhook arrives before the worker completes, we update from the webhook and when the worker runs it sees the payment already succeeded (or we mark outbox as reconciled). Reconciliation job can compare our state to provider state for aged pending items and alert or retry.",
      ],
    },
    {
      title: "Failure Mode Analysis",
      paragraphs: [
        "Crash after DB commit but before provider call: we never call the provider in the request; we only write the outbox row. After restart the worker picks up the pending row and dispatches. The provider is called once when the worker runs. No double charge because only the worker performs the call and it marks the row processed after success.",
        "Provider returns success but client times out: the client may retry with the same idempotency key. We return the stored outcome (success) without re-executing. The charge already happened; the retry is a read. If the client never got the response we have already persisted success and may have written the outbox row; the worker will not send a second charge because we do not insert a second outbox row for the same payment.",
        "Worker crash during dispatch: the worker calls the provider then must mark the outbox row processed in the same or a follow-up transaction. If the worker crashes after the provider call but before marking processed, on restart it will retry the same row. The provider receives a second call with the same idempotency key; the provider must deduplicate (return success without double-charging). So we rely on provider idempotency for this case. Alternatively we mark \"dispatching\" before the call and only set \"processed\" after; retries skip rows already in \"dispatching\" for longer than a timeout.",
      ],
    },
  ],
  externalUrl: "#",
  titleEs: "Orquestador de pagos idempotente",
  techEs: "Arquitectura backend • Sistemas transaccionales",
  overviewEs:
    "Diseñé e implementé un proceso de procesamiento de pagos seguro para reintentos con estrictas garantías de idempotencia en envíos de transacciones concurrentes. Claves de idempotencia en el request; outbox para llamadas al proveedor; reconciliación por webhook con event_id. Garantía: sin doble cargo ante reintentos del cliente, webhooks duplicados o falla de red entre commit en DB y llamada al proveedor.",
};

const projects: Project[] = [patagoniaDreams, municipalIdentity, paymentOrchestrator];

export function getProjectBySlug(slug: string): Project | null {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function getAllProjectSlugs(): ProjectSlug[] {
  return projects.map((p) => p.slug);
}
