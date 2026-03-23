# Core engineering principles

*Derived from Patagonia Dreams (transactional booking, payments) and Municipal unified login (identity gateway). Tone: senior backend, architectural mindset. No clichés.*

---

## 1. Single source of truth for critical state

For payment and identity, one component is the only writer. The frontend cannot mutate transactional or verified status; legacy systems do not authenticate users. That removes competing paths and client-side trust from the critical path.

---

## 2. Explicit trust boundaries

Define who validates, who issues, and who consumes. The gateway calls identity APIs and issues tokens; downstream services validate tokens and apply RBAC but never re-authenticate. We don't pass through "the client said they're user X"—we enforce the boundary in code and contracts.

---

## 3. Idempotency for retryable and external events

Reservation creation and webhook processing are idempotent by key or event_id. Retries and duplicate submissions become safe operations instead of failure modes. External systems retry; our design assumes it and doesn't double-apply.

---

## 4. Fail safe when verification is impossible

We never issue a "verified" or "paid" outcome when we couldn't actually verify or confirm. If national APIs or payment webhooks are unavailable, we fail safe—degraded mode or clear error—instead of relaxing the rule and pretending we verified.

---

## 5. Atomic updates for dependent state

When two states must stay in sync (e.g. payment transaction and reservation), we update them in a single database transaction where possible. We avoid "payment succeeded, reservation still pending" by committing both or neither.

---

## 6. Minimal data across boundaries

Tokens and cross-service payloads carry only what the consumer needs to authorize or fulfill the request. PII and raw registry data stay behind the boundary that owns them. That limits blast radius and keeps trust and compliance clear.

---

*Use these when asked what principles guide your engineering decisions (e.g. "How do you approach system design?" or "What do you care about in production systems?").*
