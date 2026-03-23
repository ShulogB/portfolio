# Interview-ready: ownership, trade-offs, production concerns

*Extracted from Patagonia Dreams (booking platform) and Municipal unified login (identity gateway). Tone: senior backend engineer, US/EU interview. Focus: structure, boundaries, and decision-making.*

---

## 1. Five moments of engineering ownership

**1. Webhook as source of truth**  
"I enforced webhooks as the single source of truth for payment state. The frontend cannot mutate transactional status. That eliminated redirect-based inconsistencies and removed client-side trust assumptions."

**2. Idempotency**  
"I implemented idempotency at two layers: reservation creation via idempotency keys and webhook processing via event_id tracking. Retries and duplicate submissions became safe operations instead of failure scenarios."

**3. Municipal gateway trust boundaries**  
"I defined strict trust boundaries: only the central gateway can call national identity APIs and issue tokens. Legacy systems validate tokens but never authenticate users directly, preserving auditability and control."

**4. Inventory concurrency**  
"I owned the concurrency model for inventory: we were overselling when multiple requests booked the same slot. I introduced a pessimistic lock (SELECT FOR UPDATE) inside the reservation-creation transaction and chose it over optimistic locking for operational simplicity at our conflict rate. That made double-booking a closed problem."

**5. Normalized catalog and sync**  
"I drove the canonical catalog design: one internal Activity model and an activity_provider_mapping table, sync in chunks with retry and backoff. I defined the mapping rules and failure handling so reservations never block on 'latest from provider' and sync remains safe under load and provider outages."

---

## 2. Four decisions that involved trade-offs

**1.** "We chose a modular monolith over microservices. Trade-off: we give up independent deployability and scaling per service, but we avoid the operational cost of many services, networks, and failure modes. We enforced clear domain boundaries and interfaces so we could evolve and test in slices. For our team size and deployment story, that was the right call."

**2.** "For payment webhooks we chose to validate HMAC and idempotency synchronously, then either process in-process or push to a queue and return 200. We went with queue + 200 so the gateway gets a fast response and we control retries. Trade-off: more moving parts and eventual consistency inside our system; we accepted that so we don't hold the connection or time out on the provider."

**3.** "On the municipal gateway we validate identity against RENAPER/AFIP on every login and only cache for the session. Trade-off: more calls to national APIs and dependency on their availability, but we never issue a 'verified' token when we couldn't verify, and revocations or status changes don't stick around. We defined degraded modes when those APIs are down instead of relaxing the rule."

**4.** "We centralized all auth in one gateway instead of spreading it across legacy systems. Trade-off: the gateway is a single point of failure for login. We mitigated with redundancy and runbooks. We didn't decentralize back into legacy because that would have blurred trust boundaries and made audit and compliance much harder."

---

## 3. Three real-world production concerns handled

**1.** "Webhooks were being replayed and we were double-applying payments and creating duplicate records. I introduced a processed-events table keyed by event_id and made the handler idempotent: if we've already seen the event we return 200 and do nothing. That stopped double application; we also moved payment and reservation state updates into a single DB transaction so we never leave them out of sync."

**2.** "We had overselling: concurrent requests for the same slot all saw 'available' and created reservations. I added a pessimistic lock on the availability row inside the transaction that creates the reservation (SELECT FOR UPDATE). Only one request gets the slot per transaction; the rest block or retry. We monitored contention and would have revisited with optimistic locking or a dedicated inventory service if it had become a bottleneck."

**3.** "On the identity platform, when national APIs (RENAPER, AFIP) are down we can't verify identity. We never issue a token that says 'verified' when we didn't verify. We defined degraded modes—e.g. 'identity verification unavailable' or limited access to services that don't require fresh verification—and documented them in runbooks and policy so support and citizens know what to expect."

---

*Use these as concise, first-person statements when asked about ownership, trade-offs, or production issues in behavioral or technical interviews (US/EU).*
