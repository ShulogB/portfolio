/**
 * Contenido en inglés. Cargado en el bundle inicial del cliente.
 * El contenido en español se carga bajo demanda (content-es.ts).
 */
import type { AdrLink, ExperienceSummaryItem, OptimizeForItem, ProductionDecision, TradeoffItem, UILabels } from "./content-types";

const en = {
  hero: {
    name: "Giuliano Bentevenga",
    subtitle:
      "Senior Backend Engineer focused on transactional systems, payment flows, identity gateways and strict trust boundaries. Production systems built for correctness under concurrency and failure.",
    location: "Argentina — open to remote",
    impactLine:
      "Production backend engineer: hardened payment integrity against hostile inputs, moved integrations to contract-first payloads, and operated secure-by-default APIs with clear trust boundaries.",
  },
  principles: [
    {
      title: "Single source of truth for critical state",
      description:
        "One component is the sole writer for payment and identity state. Frontend cannot mutate transactional or verified status; legacy systems do not authenticate. Removes competing writers and client-side trust from the critical path.",
    },
    {
      title: "Explicit trust boundaries",
      description:
        "Define who validates, who issues, who consumes. Gateway calls identity APIs and issues tokens; downstream services validate tokens and apply RBAC and do not re-authenticate. Boundary enforced in code and contracts.",
    },
    {
      title: "Idempotency for retryable and external events",
      description:
        "Reservation creation and webhook processing are idempotent by key or event_id. Retries and duplicate submissions become safe operations instead of failure modes. External systems retry; the design assumes it and does not double-apply.",
    },
    {
      title: "Fail safe when verification is impossible",
      description:
        "Never issue \"verified\" or \"paid\" when verification or confirmation did not succeed. If national APIs or payment webhooks are unavailable, fail safe—degraded mode or clear error—rather than relaxing the rule.",
    },
    {
      title: "Atomic updates for dependent state",
      description:
        "When two states must stay in sync (e.g. payment transaction and reservation), update them in a single database transaction where possible. Commit both or neither to avoid \"payment succeeded, reservation still pending\".",
    },
    {
      title: "Minimal data across boundaries",
      description:
        "Tokens and cross-service payloads carry only what the consumer needs to authorize or fulfill the request. PII and raw registry data stay behind the boundary that owns them. Limits blast radius and preserves compliance boundaries.",
    },
  ],
  executiveSnapshot: [
    "~2k reservations/month in production (patagoniadreams.com.ar).",
    "~45k logins/month on identity gateway (autentica.bahia.gob.ar).",
    "99.5% uptime on identity gateway over 12 months.",
    "p95 webhook-to-DB under 400 ms; 8+ backend services consume gateway tokens.",
  ],
  caseStudies: [
    {
      slug: "patagonia-dreams",
      title: "Transactional Booking & Payment Platform",
      tech: "Payments • Webhooks • Concurrency",
      preview:
        "Tourism reservation platform in production. Multi-module, multi-tenant backoffice (partners and end customers). Payments via Mercado Pago, Stripe, Pix; webhooks as single source of truth for \"reservation paid,\" with HMAC validation and idempotency by event_id. Idempotency keys on reservation creation; promotion engine with transactional claims; catalog normalization with external providers. Modular monolith, Docker, CI/CD, AWS. Transactional integrity and payment security by design.",
      diagramType: "payments" as const,
      adrs: [
        { title: "Use webhooks as single source of truth for payment status", href: "#" },
        { title: "Idempotency keys on reservation creation and event_id on webhooks", href: "#" },
        { title: "Pessimistic locking (SELECT FOR UPDATE) for availability", href: "#" },
        { title: "Modular monolith with explicit domain boundaries", href: "#" },
        { title: "HMAC validation for all incoming webhook payloads", href: "#" },
      ] as AdrLink[],
    },
    {
      slug: "municipal-identity",
      title: "Municipal Unified Identity Platform",
      tech: "Identity • Trust Boundaries • RBAC",
      preview:
        "Centralized authentication gateway for a municipality: citizens authenticate once and access multiple government services with a single token. Identity is validated against national registries (Mi Argentina, RENAPER, AFIP) on every login; the gateway is the only component that calls those APIs and the only issuer of session tokens. Legacy systems consume signed tokens and enforce RBAC; they do not re-authenticate. No PII in tokens; fail safe when national APIs are unavailable. Audit and RBAC at gateway and service layer.",
      diagramType: "identity" as const,
      adrs: [
        { title: "Gateway as sole issuer of session tokens; legacy systems validate only", href: "#" },
        { title: "No PII in tokens; minimal claims for authorization", href: "#" },
        { title: "Fail safe when national identity APIs are unavailable", href: "#" },
        { title: "RBAC enforced at gateway and at service layer", href: "#" },
        { title: "Audit logging for authentication and token issuance", href: "#" },
      ] as AdrLink[],
    },
    {
      slug: "payment-orchestrator",
      title: "Idempotent Payment Orchestrator",
      tech: "Backend Architecture • Transactional Systems",
      preview:
        "Designed and implemented a retry-safe payment processing pipeline with strict idempotency guarantees under concurrent transaction submissions.",
      diagramType: "payments" as const,
      adrs: [
        { title: "Idempotency key required for all payment initiation requests", href: "#" },
        { title: "Outbox for provider calls; no side effects inside request lifecycle", href: "#" },
        { title: "Webhook processing idempotent by provider event_id", href: "#" },
        { title: "Transaction boundaries: single DB transaction per state transition", href: "#" },
        { title: "Reconciliation and failure mode handling", href: "#" },
      ] as AdrLink[],
    },
  ],
  experienceSummary: [
    { scope: "patagoniadreams.com.ar — reservation availability", challenge: "concurrent bookings for same slot, race to mark paid", decision: "SELECT FOR UPDATE on availability row; webhooks only path to \"reservation paid\"", impact: "double-booking eliminated; ~2k reservations/month in production." },
    { scope: "patagoniadreams.com.ar — payment webhooks", challenge: "duplicate or replayed payloads, provider retries", decision: "HMAC validation on all webhooks; idempotency by event_id; single writer for payment state", impact: "no double-apply; retries safe; p95 webhook-to-DB under 400 ms." },
    { scope: "patagoniadreams.com.ar — reservation creation", challenge: "duplicate submissions (double-click, client retries)", decision: "idempotency key per creation request; unique constraint on key in DB", impact: "retries safe; no duplicate reservations." },
    { scope: "patagoniadreams.com.ar — payment and reservation state", challenge: "two states must stay in sync; frontend could not drive status", decision: "single DB transaction on webhook: create/update payment record and set reservation paid", impact: "no \"paid\" without webhook; no split state." },
    { scope: "autentica.bahia.gob.ar — session token lifecycle", challenge: "who issues, who validates; avoid PII in tokens", decision: "gateway sole issuer; tokens carry only claims (sub, roles, exp); RBAC at gateway and at each service", impact: "clear trust boundary; ~45k logins/month; 99.5% uptime over 12 months." },
    { scope: "autentica.bahia.gob.ar — identity verification", challenge: "national APIs (RENAPER, AFIP) down or high latency", decision: "never issue \"verified\" when verification did not succeed; degraded mode + alerting when APIs unavailable", impact: "no false \"verified\"; re-validation on every login." },
    { scope: "autentica.bahia.gob.ar — legacy service integration", challenge: "legacy systems must not re-authenticate; single source of identity", decision: "gateway issues signed tokens; services validate signature and apply RBAC only; no direct calls to national APIs from services", impact: "single place for identity; 8+ backend services consume tokens." },
    { scope: "autentica.bahia.gob.ar — authorization and audit", challenge: "role and resource access across services; who did what", decision: "RBAC at gateway (route-level) and at service (resource-level); roles in token claims; DB constraints and audit logging for sensitive actions", impact: "consistent policy; full audit trail for compliance." },
  ] as ExperienceSummaryItem[],
  productionBackends: [
    {
      title: "Payment integrity under hostile inputs",
      context:
        "The payment path accepted attacker-controlled signals (webhook mode flags and client-sent final price), enabling false approvals.",
      decision:
        "Enforced signature validation independently of request flags and recomputed/validated amounts server-side in checkout and webhooks.",
      tradeoff:
        "Higher validation complexity and edge cases around rounding tolerance.",
      outcome:
        "Closed direct fraud paths and prevented invalid approved states from reaching reservation status.",
    },
    {
      title: "Contract-first integrations over text parsing",
      context:
        "Transfer details were propagated as free text, causing ambiguity and brittle downstream behavior.",
      decision:
        "Moved package transfer payloads to structured contract fields (kind + trfDetail) with strict conditional validation and normalization.",
      tradeoff:
        "More schema and validation branches to maintain across product/package flows.",
      outcome:
        "Deterministic integration behavior and cleaner end-to-end operational data quality.",
    },
    {
      title: "Secure-by-default API posture",
      context:
        "Open permissions, verbose errors, and inconsistent endpoint controls increased exposure risk.",
      decision:
        "Set authenticated defaults globally, added scoped throttling for sensitive routes, and moved technical detail from client responses to internal logs.",
      tradeoff:
        "Tighter operational discipline and occasional contract adjustments in endpoint responses.",
      outcome:
        "Lowered PII exposure and abuse surface while improving resilience under noisy traffic.",
    },
  ] as ProductionDecision[],
  decisions: [
    "Modular monolith over microservices: explicit domain boundaries and interfaces; lower operational cost than many services.",
    "Webhooks as the only path to \"reservation paid\"; frontend cannot mutate transactional status. Redirect-based state updates removed.",
    "Idempotency at two layers—reservation creation via idempotency keys, webhook processing via event_id—so retries and duplicate submissions are safe.",
    "Strict trust boundaries on identity: only the central gateway calls national APIs and issues tokens; legacy systems validate tokens but never authenticate.",
    "Pessimistic lock (SELECT FOR UPDATE) on availability when creating a reservation; double-booking eliminated at observed conflict rate.",
    "Identity validated on every login; never issue \"verified\" when verification failed. Degraded modes when national APIs are unavailable.",
  ],
  stack: ["PostgreSQL", "Django REST Framework", "Docker", "CI/CD", "GitHub Actions", "AWS", "Stripe", "Mercado Pago", "Cognito"],
  explicitTradeoffs: [
    { decision: "Webhooks as single source of truth for \"paid\".", gained: "No frontend or redirect driving state; provider is authority. Double-apply impossible by design.", sacrificed: "User waits for webhook; we depend on provider delivery and our endpoint availability. No instant \"paid\" from redirect." },
    { decision: "Pessimistic lock (SELECT FOR UPDATE) on availability.", gained: "No double-booking; deterministic behaviour at consistency boundary.", sacrificed: "Throughput on hot slots limited; lock contention under load. No optimistic retry path." },
    { decision: "Modular monolith over microservices.", gained: "Single deployment, single DB, transactional consistency. Lower operational cost.", sacrificed: "Cannot scale domains independently. One bug or deploy can affect all. Must scale the whole app." },
    { decision: "Gateway as sole issuer of tokens; legacy systems validate only.", gained: "One trust boundary. Legacy systems do not touch identity APIs or PII.", sacrificed: "Gateway is single point of failure for login. All login traffic through one component." },
    { decision: "Idempotency keys at application layer.", gained: "Safe retries; no double charge or double reservation. Client and webhook duplicates are no-ops.", sacrificed: "Client must supply or we derive key; key storage and TTL; more complexity than fire-and-forget." },
    { decision: "No PII in tokens; minimal claims only.", gained: "Blast radius limited on token leak. Compliance boundary clear.", sacrificed: "Services cannot display user details without calling gateway or user store; extra round-trips or caching." },
    { decision: "Synchronous audit log write in critical path.", gained: "No lost events on crash. Guaranteed audit trail.", sacrificed: "Added latency and write load; log storage grows. No async fire-and-forget for audit." },
  ] as TradeoffItem[],
  deepDiveEssays: [
    { title: "Idempotency in distributed payments", paragraphs: ["Payment providers and webhooks deliver at least once. Retries, network partitions, and client double-submits make duplicate events the norm. Idempotency is implemented at two distinct layers: client-initiated operations (e.g. reservation creation) and server-driven events (webhooks).", "For client operations we use an idempotency key (supplied by the client or derived from a deterministic hash of intent). The key is the sole lookup for the stored outcome; the first request executes and persists the result, subsequent requests return the stored result without re-executing. Key design: store outcome (success/failure + response payload or error code), not just \"seen\". That allows safe replay with correct semantics.", "For webhooks we key on event_id (or provider-side id). The same event_id may be delivered multiple times; we apply the state transition once and ignore duplicates. Critical: the idempotency check and the state update (e.g. mark reservation paid) live in the same transaction so we never double-apply under concurrency. Key expiry and cleanup policies prevent unbounded growth while retaining keys long enough to cover provider retry windows (e.g. 24–72h)."] },
    { title: "Atomic state transitions and race conditions", paragraphs: ["Double-booking occurs when two concurrent requests both read \"available\" and then both commit a booking. The fix is a single writer and serialisation at the consistency boundary. We use SELECT FOR UPDATE on the availability row (or the aggregate that owns it) inside the same transaction that creates the reservation. The second request blocks until the first commits or rolls back; it then sees updated state and either succeeds on remaining capacity or fails consistently.", "When the transition spans two stores (e.g. payment record and reservation), we keep them in one DB transaction where both tables live in the same database. Commit creates the payment row and updates the reservation in one atomic step. When payment is external (provider webhook), we do not have a single distributed transaction—we treat the webhook as the source of truth for \"paid\" and update our reservation in one local transaction keyed by idempotent event_id; the only writer for that transition is the webhook handler.", "We avoid saga-style compensating transactions for the core path: they add complexity and new failure modes. Where we must coordinate across services, we use an outbox or single write that triggers downstream work, with idempotent consumers so duplicate events do not double-apply."] },
    { title: "Token design and trust boundaries", paragraphs: ["The gateway is the only component that calls identity providers (national APIs, etc.) and the only issuer of session tokens. Downstream services validate tokens and enforce RBAC; they never re-authenticate. That defines a clear trust boundary: everything behind the gateway trusts the gateway's issuance and treats the token as the authority for identity and claims.", "Tokens carry minimal claims: identity id, roles, scope, expiry. No PII, no raw registry data. That limits blast radius on token leak and keeps compliance boundaries clear (PII stays in the system that owns it). We use signed tokens (e.g. JWT with HMAC or asymmetric signing); validators verify signature and expiry and reject anything else. Opaque tokens with a server-side lookup are an alternative when revocation must be immediate and global.", "Revocation is handled at the gateway (session invalidation, logout). Downstream services rely on short-lived tokens or periodic re-validation if strict \"logout everywhere\" is required without a shared revocation store."] },
    { title: "Audit logging strategy", paragraphs: ["We log state-changing actions with who (actor id or service), what (action type, resource id), when (timestamp), and enough context to reproduce (e.g. idempotency key, event_id, id of created/updated entity). Logs are append-only and immutable; no in-place edits. That supports compliance and post-incident analysis.", "Structured fields (JSON or key-value) allow querying by correlation_id, request_id, or user_id. Correlation IDs are propagated across service boundaries so a single payment or login can be traced from gateway through to DB write. Retention is policy-driven: short for noisy debug logs, longer for audit and payment-related events.", "Sensitive data is not logged in plain text; we log identifiers and event types, not full PII or card data. Audit logs are written synchronously in the critical path so we do not lose events on crash; we keep the payload small and the write fast (e.g. to a dedicated table or log stream)."] },
    { title: "Observability and failure detection", paragraphs: ["Health checks are split: liveness (process up) vs readiness (dependencies acceptable). A service that cannot reach the DB or an identity provider should fail readiness so the orchestrator does not send traffic until it recovers. We avoid marking healthy when we cannot fulfill requests.", "We instrument payment and identity flows with metrics: latency (p50/p99), error rate by outcome (e.g. success, idempotent duplicate, validation failure), and idempotency hit rate. Alerts fire on elevated error rate, dependency failures (e.g. national API down), and payment webhook processing failures. Dashboards show success vs duplicate vs failure so we can distinguish retries from real regressions.", "Distributed tracing (trace_id across services) ties a request from API through queue and DB. When a payment or login fails, we can follow the same trace_id in logs and traces. Failure detection is not only \"service down\" but \"succeeding with degraded semantics\"—e.g. we alert when we cannot verify identity and are serving unverified sessions, so the decision to degrade is explicit and visible."] },
  ],
  optimizeFor: [
    { title: "Correctness over convenience", explanation: "State transitions and payment outcomes must be correct under retries and failure; shortcuts that relax consistency are not acceptable." },
    { title: "Clear trust boundaries", explanation: "One component owns each critical boundary (who issues tokens, who writes payment state); no shared or ambiguous ownership." },
    { title: "Explicit ownership of state transitions", explanation: "Single writer per state; no frontend or redirect driving \"paid\" or \"verified\" without verification." },
    { title: "Observability from day one", explanation: "Logs, metrics and tracing in place before scale; failure modes and degraded behaviour are visible and alertable." },
    { title: "Operational simplicity over premature distribution", explanation: "Modular monolith with clear boundaries preferred over microservices until scale and team justify the operational cost." },
  ] as OptimizeForItem[],
  ui: {
    hero: { tagline: "System design focused portfolio", caseStudies: "Case studies", github: "GitHub", linkedin: "LinkedIn", downloadResume: "Download Resume (PDF)" },
    sections: { home: "Home", executiveSnapshot: "Executive Snapshot", experienceSummary: "Impact & Experience", caseStudies: "Case studies", principles: "Engineering principles", howBuild: "How I build production backends", architectureDeepDive: "Architecture & Design", explicitTradeoffs: "Explicit Tradeoffs", decisions: "Selected engineering decisions", stack: "Technologies & Integrations", optimizeFor: "What I Optimize For", contact: "Contact" },
    contact: { name: "Name", email: "Email", message: "Message", send: "Send", successMessage: "Message sent. I'll get back to you soon.", errorMessage: "Could not send. Try again or email directly." },
    caseStudy: { label: "Case Study", scaleConstraints: "Scale & Constraints", rejected: "What was explicitly rejected", whatWouldBreak: "What would break this system?", architectureDecisionRecords: "Architecture Decision Records", architectureAndDecisions: "Architecture & decisions", scaleConstraintsRows: { requestVolume: "Request volume", concurrency: "Concurrency", externalDependencies: "External dependencies", failureModes: "Failure modes", dataConsistency: "Data consistency" }, gainedLabel: "Gained:", sacrificedLabel: "Sacrificed:" },
    footer: "Backend systems built for production.",
    adminLogin: "Admin",
    project: { overview: "Overview", viewLiveSite: "View live site", deepDive: "Deep dive", images: "Images" },
  } as UILabels,
};

export default en;
