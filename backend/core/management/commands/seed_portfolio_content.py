"""
Rellena el backend con el contenido actual del frontend (lib/content.ts).
Ejecutar una vez: python manage.py seed_portfolio_content
Para volver a cargar desde cero, borrar los registros desde el admin y volver a ejecutar.
"""
import json
from django.core.management.base import BaseCommand
from core.models import (
    ExperienceSummary,
    Principle,
    Technology,
    ExecutiveSnapshot,
    Decision,
    Tradeoff,
    DeepDiveEssay,
    OptimizeFor,
)
from case_studies.models import CaseStudy, EngineeringDecision


class Command(BaseCommand):
    help = "Carga el contenido del portfolio (equivalente a lib/content.ts del frontend)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Borrar todos los registros de contenido antes de crear (opcional).",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear_all()
        self._seed_experience_summary()
        self._seed_principles()
        self._seed_technologies()
        self._seed_executive_snapshot()
        self._seed_decisions()
        self._seed_tradeoffs()
        self._seed_deep_dive_essays()
        self._seed_optimize_for()
        self._seed_case_studies()
        self.stdout.write(self.style.SUCCESS("Contenido del portfolio cargado correctamente."))

    def _clear_all(self):
        ExperienceSummary.objects.all().delete()
        Principle.objects.all().delete()
        Technology.objects.all().delete()
        ExecutiveSnapshot.objects.all().delete()
        Decision.objects.all().delete()
        Tradeoff.objects.all().delete()
        DeepDiveEssay.objects.all().delete()
        OptimizeFor.objects.all().delete()
        CaseStudy.objects.all().delete()
        self.stdout.write("Registros de contenido borrados.")

    def _seed_experience_summary(self):
        data = [
            ("patagoniadreams.com.ar — reservation availability", "concurrent bookings for same slot, race to mark paid", "SELECT FOR UPDATE on availability row; webhooks only path to \"reservation paid\"", "double-booking eliminated; ~2k reservations/month in production."),
            ("patagoniadreams.com.ar — payment webhooks", "duplicate or replayed payloads, provider retries", "HMAC validation on all webhooks; idempotency by event_id; single writer for payment state", "no double-apply; retries safe; p95 webhook-to-DB under 400 ms."),
            ("patagoniadreams.com.ar — reservation creation", "duplicate submissions (double-click, client retries)", "idempotency key per creation request; unique constraint on key in DB", "retries safe; no duplicate reservations."),
            ("patagoniadreams.com.ar — payment and reservation state", "two states must stay in sync; frontend could not drive status", "single DB transaction on webhook: create/update payment record and set reservation paid", "no \"paid\" without webhook; no split state."),
            ("autentica.bahia.gob.ar — session token lifecycle", "who issues, who validates; avoid PII in tokens", "gateway sole issuer; tokens carry only claims (sub, roles, exp); RBAC at gateway and at each service", "clear trust boundary; ~45k logins/month; 99.5% uptime over 12 months."),
            ("autentica.bahia.gob.ar — identity verification", "national APIs (RENAPER, AFIP) down or high latency", "never issue \"verified\" when verification did not succeed; degraded mode + alerting when APIs unavailable", "no false \"verified\"; re-validation on every login."),
            ("autentica.bahia.gob.ar — legacy service integration", "legacy systems must not re-authenticate; single source of identity", "gateway issues signed tokens; services validate signature and apply RBAC only; no direct calls to national APIs from services", "single place for identity; 8+ backend services consume tokens."),
            ("autentica.bahia.gob.ar — authorization and audit", "role and resource access across services; who did what", "RBAC at gateway (route-level) and at service (resource-level); roles in token claims; DB constraints and audit logging for sensitive actions", "consistent policy; full audit trail for compliance."),
        ]
        for i, (scope, challenge, decision, impact) in enumerate(data):
            ExperienceSummary.objects.get_or_create(scope=scope[:255], defaults={"challenge": challenge, "decision": decision, "impact": impact, "order": i})

    def _seed_principles(self):
        data = [
            ("Single source of truth for critical state", "One component is the sole writer for payment and identity state. Frontend cannot mutate transactional or verified status; legacy systems do not authenticate. Removes competing writers and client-side trust from the critical path."),
            ("Explicit trust boundaries", "Define who validates, who issues, who consumes. Gateway calls identity APIs and issues tokens; downstream services validate tokens and apply RBAC and do not re-authenticate. Boundary enforced in code and contracts."),
            ("Idempotency for retryable and external events", "Reservation creation and webhook processing are idempotent by key or event_id. Retries and duplicate submissions become safe operations instead of failure modes. External systems retry; the design assumes it and does not double-apply."),
            ("Fail safe when verification is impossible", "Never issue \"verified\" or \"paid\" when verification or confirmation did not succeed. If national APIs or payment webhooks are unavailable, fail safe—degraded mode or clear error—rather than relaxing the rule."),
            ("Atomic updates for dependent state", "When two states must stay in sync (e.g. payment transaction and reservation), update them in a single database transaction where possible. Commit both or neither to avoid \"payment succeeded, reservation still pending\"."),
            ("Minimal data across boundaries", "Tokens and cross-service payloads carry only what the consumer needs to authorize or fulfill the request. PII and raw registry data stay behind the boundary that owns them. Limits blast radius and preserves compliance boundaries."),
        ]
        for i, (title, description) in enumerate(data):
            Principle.objects.get_or_create(title=title, defaults={"description": description, "order": i})

    def _seed_technologies(self):
        names = ["PostgreSQL", "Django REST Framework", "Docker", "CI/CD", "GitHub Actions", "AWS", "Stripe", "Mercado Pago", "Cognito"]
        for i, name in enumerate(names):
            Technology.objects.get_or_create(name=name, defaults={"order": i})

    def _seed_executive_snapshot(self):
        texts = [
            "~2k reservations/month in production (patagoniadreams.com.ar).",
            "~45k logins/month on identity gateway (autentica.bahia.gob.ar).",
            "99.5% uptime on identity gateway over 12 months.",
            "p95 webhook-to-DB under 400 ms; 8+ backend services consume gateway tokens.",
        ]
        for i, text in enumerate(texts):
            ExecutiveSnapshot.objects.get_or_create(text=text[:500], defaults={"order": i})

    def _seed_decisions(self):
        texts = [
            "Modular monolith over microservices: explicit domain boundaries and interfaces; lower operational cost than many services.",
            "Webhooks as the only path to \"reservation paid\"; frontend cannot mutate transactional status. Redirect-based state updates removed.",
            "Idempotency at two layers—reservation creation via idempotency keys, webhook processing via event_id—so retries and duplicate submissions are safe.",
            "Strict trust boundaries on identity: only the central gateway calls national APIs and issues tokens; legacy systems validate tokens but never authenticate.",
            "Pessimistic lock (SELECT FOR UPDATE) on availability when creating a reservation; double-booking eliminated at observed conflict rate.",
            "Identity validated on every login; never issue \"verified\" when verification failed. Degraded modes when national APIs are unavailable.",
        ]
        for i, text in enumerate(texts):
            Decision.objects.get_or_create(text=text, defaults={"order": i})

    def _seed_tradeoffs(self):
        data = [
            ("Webhooks as single source of truth for \"paid\".", "No frontend or redirect driving state; provider is authority. Double-apply impossible by design.", "User waits for webhook; we depend on provider delivery and our endpoint availability. No instant \"paid\" from redirect."),
            ("Pessimistic lock (SELECT FOR UPDATE) on availability.", "No double-booking; deterministic behaviour at consistency boundary.", "Throughput on hot slots limited; lock contention under load. No optimistic retry path."),
            ("Modular monolith over microservices.", "Single deployment, single DB, transactional consistency. Lower operational cost.", "Cannot scale domains independently. One bug or deploy can affect all. Must scale the whole app."),
            ("Gateway as sole issuer of tokens; legacy systems validate only.", "One trust boundary. Legacy systems do not touch identity APIs or PII.", "Gateway is single point of failure for login. All login traffic through one component."),
            ("Idempotency keys at application layer.", "Safe retries; no double charge or double reservation. Client and webhook duplicates are no-ops.", "Client must supply or we derive key; key storage and TTL; more complexity than fire-and-forget."),
            ("No PII in tokens; minimal claims only.", "Blast radius limited on token leak. Compliance boundary clear.", "Services cannot display user details without calling gateway or user store; extra round-trips or caching."),
            ("Synchronous audit log write in critical path.", "No lost events on crash. Guaranteed audit trail.", "Added latency and write load; log storage grows. No async fire-and-forget for audit."),
        ]
        for i, (decision, gained, sacrificed) in enumerate(data):
            Tradeoff.objects.get_or_create(decision=decision[:500], defaults={"gained": gained, "sacrificed": sacrificed, "order": i})

    def _seed_deep_dive_essays(self):
        data = [
            ("Idempotency in distributed payments", [
                "Payment providers and webhooks deliver at least once. Retries, network partitions, and client double-submits make duplicate events the norm. Idempotency is implemented at two distinct layers: client-initiated operations (e.g. reservation creation) and server-driven events (webhooks).",
                "For client operations we use an idempotency key (supplied by the client or derived from a deterministic hash of intent). The key is the sole lookup for the stored outcome; the first request executes and persists the result, subsequent requests return the stored result without re-executing. Key design: store outcome (success/failure + response payload or error code), not just \"seen\". That allows safe replay with correct semantics.",
                "For webhooks we key on event_id (or provider-side id). The same event_id may be delivered multiple times; we apply the state transition once and ignore duplicates. Critical: the idempotency check and the state update (e.g. mark reservation paid) live in the same transaction so we never double-apply under concurrency. Key expiry and cleanup policies prevent unbounded growth while retaining keys long enough to cover provider retry windows (e.g. 24–72h).",
            ]),
            ("Atomic state transitions and race conditions", [
                "Double-booking occurs when two concurrent requests both read \"available\" and then both commit a booking. The fix is a single writer and serialisation at the consistency boundary. We use SELECT FOR UPDATE on the availability row (or the aggregate that owns it) inside the same transaction that creates the reservation. The second request blocks until the first commits or rolls back; it then sees updated state and either succeeds on remaining capacity or fails consistently.",
                "When the transition spans two stores (e.g. payment record and reservation), we keep them in one DB transaction where both tables live in the same database. Commit creates the payment row and updates the reservation in one atomic step. When payment is external (provider webhook), we do not have a single distributed transaction—we treat the webhook as the source of truth for \"paid\" and update our reservation in one local transaction keyed by idempotent event_id; the only writer for that transition is the webhook handler.",
                "We avoid saga-style compensating transactions for the core path: they add complexity and new failure modes. Where we must coordinate across services, we use an outbox or single write that triggers downstream work, with idempotent consumers so duplicate events do not double-apply.",
            ]),
            ("Token design and trust boundaries", [
                "The gateway is the only component that calls identity providers (national APIs, etc.) and the only issuer of session tokens. Downstream services validate tokens and enforce RBAC; they never re-authenticate. That defines a clear trust boundary: everything behind the gateway trusts the gateway's issuance and treats the token as the authority for identity and claims.",
                "Tokens carry minimal claims: identity id, roles, scope, expiry. No PII, no raw registry data. That limits blast radius on token leak and keeps compliance boundaries clear (PII stays in the system that owns it). We use signed tokens (e.g. JWT with HMAC or asymmetric signing); validators verify signature and expiry and reject anything else. Opaque tokens with a server-side lookup are an alternative when revocation must be immediate and global.",
                "Revocation is handled at the gateway (session invalidation, logout). Downstream services rely on short-lived tokens or periodic re-validation if strict \"logout everywhere\" is required without a shared revocation store.",
            ]),
            ("Audit logging strategy", [
                "We log state-changing actions with who (actor id or service), what (action type, resource id), when (timestamp), and enough context to reproduce (e.g. idempotency key, event_id, id of created/updated entity). Logs are append-only and immutable; no in-place edits. That supports compliance and post-incident analysis.",
                "Structured fields (JSON or key-value) allow querying by correlation_id, request_id, or user_id. Correlation IDs are propagated across service boundaries so a single payment or login can be traced from gateway through to DB write. Retention is policy-driven: short for noisy debug logs, longer for audit and payment-related events.",
                "Sensitive data is not logged in plain text; we log identifiers and event types, not full PII or card data. Audit logs are written synchronously in the critical path so we do not lose events on crash; we keep the payload small and the write fast (e.g. to a dedicated table or log stream).",
            ]),
            ("Observability and failure detection", [
                "Health checks are split: liveness (process up) vs readiness (dependencies acceptable). A service that cannot reach the DB or an identity provider should fail readiness so the orchestrator does not send traffic until it recovers. We avoid marking healthy when we cannot fulfill requests.",
                "We instrument payment and identity flows with metrics: latency (p50/p99), error rate by outcome (e.g. success, idempotent duplicate, validation failure), and idempotency hit rate. Alerts fire on elevated error rate, dependency failures (e.g. national API down), and payment webhook processing failures. Dashboards show success vs duplicate vs failure so we can distinguish retries from real regressions.",
                "Distributed tracing (trace_id across services) ties a request from API through queue and DB. When a payment or login fails, we can follow the same trace_id in logs and traces. Failure detection is not only \"service down\" but \"succeeding with degraded semantics\"—e.g. we alert when we cannot verify identity and are serving unverified sessions, so the decision to degrade is explicit and visible.",
            ]),
        ]
        for title, paragraphs in data:
            para_text = "\n\n".join(paragraphs)
            DeepDiveEssay.objects.get_or_create(title=title, defaults={"paragraphs": para_text})

    def _seed_optimize_for(self):
        data = [
            ("Correctness over convenience", "State transitions and payment outcomes must be correct under retries and failure; shortcuts that relax consistency are not acceptable."),
            ("Clear trust boundaries", "One component owns each critical boundary (who issues tokens, who writes payment state); no shared or ambiguous ownership."),
            ("Explicit ownership of state transitions", "Single writer per state; no frontend or redirect driving \"paid\" or \"verified\" without verification."),
            ("Observability from day one", "Logs, metrics and tracing in place before scale; failure modes and degraded behaviour are visible and alertable."),
            ("Operational simplicity over premature distribution", "Modular monolith with clear boundaries preferred over microservices until scale and team justify the operational cost."),
        ]
        for i, (title, explanation) in enumerate(data):
            OptimizeFor.objects.get_or_create(title=title, defaults={"explanation": explanation, "order": i})

    def _seed_case_studies(self):
        case_studies_data = [
            {
                "slug": "patagonia-dreams",
                "title": "Transactional Booking & Payment Platform",
                "tech": "Payments • Webhooks • Concurrency",
                "preview": "Tourism reservation platform in production. Multi-module, multi-tenant backoffice (partners and end customers). Payments via Mercado Pago, Stripe, Pix; webhooks as single source of truth for \"reservation paid,\" with HMAC validation and idempotency by event_id. Idempotency keys on reservation creation; promotion engine with transactional claims; catalog normalization with external providers. Modular monolith, Docker, CI/CD, AWS. Transactional integrity and payment security by design.",
                "diagram_type": "payments",
                "adrs": [
                    {"title": "Use webhooks as single source of truth for payment status", "href": "#"},
                    {"title": "Idempotency keys on reservation creation and event_id on webhooks", "href": "#"},
                    {"title": "Pessimistic locking (SELECT FOR UPDATE) for availability", "href": "#"},
                    {"title": "Modular monolith with explicit domain boundaries", "href": "#"},
                    {"title": "HMAC validation for all incoming webhook payloads", "href": "#"},
                ],
            },
            {
                "slug": "municipal-identity",
                "title": "Municipal Unified Identity Platform",
                "tech": "Identity • Trust Boundaries • RBAC",
                "preview": "Centralized authentication gateway for a municipality: citizens authenticate once and access multiple government services with a single token. Identity is validated against national registries (Mi Argentina, RENAPER, AFIP) on every login; the gateway is the only component that calls those APIs and the only issuer of session tokens. Legacy systems consume signed tokens and enforce RBAC; they do not re-authenticate. No PII in tokens; fail safe when national APIs are unavailable. Audit and RBAC at gateway and service layer.",
                "diagram_type": "identity",
                "adrs": [
                    {"title": "Gateway as sole issuer of session tokens; legacy systems validate only", "href": "#"},
                    {"title": "No PII in tokens; minimal claims for authorization", "href": "#"},
                    {"title": "Fail safe when national identity APIs are unavailable", "href": "#"},
                    {"title": "RBAC enforced at gateway and at service layer", "href": "#"},
                    {"title": "Audit logging for authentication and token issuance", "href": "#"},
                ],
            },
            {
                "slug": "payment-orchestrator",
                "title": "Idempotent Payment Orchestrator",
                "tech": "Backend Architecture • Transactional Systems",
                "preview": "Designed and implemented a retry-safe payment processing pipeline with strict idempotency guarantees under concurrent transaction submissions.",
                "diagram_type": "payments",
                "adrs": [
                    {"title": "Idempotency key required for all payment initiation requests", "href": "#"},
                    {"title": "Outbox for provider calls; no side effects inside request lifecycle", "href": "#"},
                    {"title": "Webhook processing idempotent by provider event_id", "href": "#"},
                    {"title": "Transaction boundaries: single DB transaction per state transition", "href": "#"},
                    {"title": "Reconciliation and failure mode handling", "href": "#"},
                ],
            },
        ]
        for cs in case_studies_data:
            CaseStudy.objects.get_or_create(
                slug=cs["slug"],
                defaults={
                    "title": cs["title"],
                    "summary": cs["preview"],
                    "content": cs["preview"],
                    "metrics": {"tech": cs["tech"], "diagramType": cs["diagram_type"], "adrs": cs["adrs"]},
                    "published": True,
                },
            )
