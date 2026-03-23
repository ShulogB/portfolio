# Patagonia Dreams — Backend engineering case study

*Written as a senior engineer explaining the system in an interview. Focus: core challenges, architectural decisions, trade-offs, production concerns.*

---

## What we built and why it’s non-trivial

Patagonia Dreams is a tourism reservation platform in production. From the outside it’s “book an experience, pay, get confirmed.” From the backend side you have: multiple user types (admins, partners, end customers), a catalog that’s really a normalized view of several external providers, a promotions engine that has to play nice with inventory and payments, and payment flows that must never double-charge or mark a booking as paid without real money. So the core challenge was **transactional integrity and clear ownership of state** across reservations, payments, promotions, and external systems.

We didn’t need a distributed system for its own sake—team size and deployment story mattered—so we went with a **modular monolith**. Clear bounded contexts (reservations, payments, promotions, catalog, reviews), each with its own domain and application services, talking through well-defined interfaces. That gave us room to evolve and test in slices without the operational cost of many services, queues, and failure modes. The trade-off: we have to be strict about not crossing domain boundaries with direct dependencies. If payments need to update a reservation, that’s done via an explicit contract (e.g. “reservation service exposes: markAsPaid(reservationId, paymentRef)”), not by the payment module touching reservation tables.

---

## Reservations: one source of truth, no double booking

The reservation lifecycle is a **explicit state machine**: draft → pending_payment → paid → confirmed (and cancelled / completed / expired). Transitions are defined in the domain; the API rejects invalid ones. That avoids “magic” state changes and makes it clear what can happen from each state.

We had two main production concerns: **double reservation** (user double-submits or retries) and **reservation marked paid without real payment** (trusting the client or a redirect).

For double reservation we introduced **idempotency keys** on the “create reservation” endpoint. The client sends a key (header or body); we store it in `idempotency_keys` with the response we returned. Same key again → we return the same response without re-running the flow. So one logical “create” always maps to one reservation, even with retries or duplicate tabs.

For “paid” we made a strict rule: **the only way a reservation moves to paid is when the payment module says so, after validating a webhook**. The frontend never updates payment or reservation status. So we don’t trust the redirect; we don’t trust the client. We trust the payment provider’s event, and we verify it.

---

## Payments: webhooks, HMAC, idempotency, and state

Payment providers send webhooks. Those can be replayed or forged if we’re not careful, and they can be delivered more than once. So we had to get three things right: **authenticity**, **idempotency**, and **atomicity with the reservation**.

**Authenticity:** Every webhook is signed (e.g. Stripe-Signature, Mercado Pago’s header). We verify **HMAC** over the raw body with the provider’s secret before doing anything. Read body as raw—don’t parse it first or the signature won’t match. Constant-time comparison; if it fails we return 401 and don’t persist or queue anything. That’s the gate: no valid signature, no side effects.

**Idempotency:** Providers retry. We store processed **event_id**s (per provider). If we’ve already seen this `event_id`, we return 200 and do nothing. So retries don’t double-apply the payment or double-update the reservation. The whole handler is idempotent by event.

**Atomicity:** When we process “payment succeeded,” we update the payment transaction state and the reservation state (e.g. to `paid`) in the **same database transaction**. We don’t want “payment recorded as succeeded” and “reservation still pending_payment” because the process died in between. If we can’t do it in one transaction (e.g. we’ve moved to a queue), we design so that the next step can safely retry and we still never double-apply thanks to `event_id`.

We also had to decide: process webhook synchronously or enqueue? We validate (HMAC + idempotency) synchronously; if that passes we can either process in-process and then respond, or push to a queue and respond 200 immediately and let a worker do the rest with **retry and backoff**. The second option avoids timeouts to the provider and gives us control over retries and dead-letter. The trade-off is more moving parts and eventual consistency within our system; we accepted that so the gateway gets a fast 200 and we don’t hold the connection.

---

## Concurrency and inventory

When several requests tried to book the same slot, we saw races: everyone saw “available” and we oversold. We needed a **concurrency** strategy. Options: optimistic locking (version column) or pessimistic (lock the row). We went **pessimistic**: `SELECT ... FOR UPDATE` on the availability/slot row inside the transaction that creates the reservation. For our load and conflict rate it was simpler to reason about and operate. If we’d had high contention we might have revisited with optimistic locking or a dedicated inventory service.

---

## Promotions: domain boundary and global limits

The promotions engine is a separate subdomain. It doesn’t know about payment gateways or external APIs. It receives a “cart” or draft reservation (items, base prices, dates, partner) and returns applicable discounts and final amounts. The reservation/payment flow calls it and then applies the result and persists coupon redemptions. That keeps pricing and promotion rules in one place and avoids the payment or reservation module encoding promotion logic.

We had to handle **global limits** (e.g. “this coupon can be used 100 times total”). If we just read a counter and then increment, we can overshoot under concurrency. So we do the increment (or “claim” of a use) inside the **same transaction** that creates the reservation, with a constraint or lock so the count can’t exceed the limit. Same idea as inventory: don’t commit unless we can commit the side effect.

---

## Catalog: normalized model and eventual sync

Activities come from multiple providers with different IDs and schemas. We needed one internal model for search, booking, and reporting. So we introduced a **normalized** `Activity` entity and an **activity_provider_mapping** table (internal_id, provider_id, external_id, last_synced_at). Sync runs in jobs—scheduled or queue-driven—in **chunks** so one big run doesn’t block or time out. We upsert by (provider_id, external_id). Consistency is **eventual**; we don’t block reservations on “latest from provider,” but we do validate against what we have at booking time. External API calls use **retry with exponential backoff** and we don’t retry business 4xx. So: clear ownership of the canonical model, explicit mapping, and sync that’s safe under failure and load.

---

## Design Tradeoffs & Failure Modes

**Tradeoffs**

1. **Synchronous webhook handling vs timeout and backpressure.** Processing the full payment→reservation update in the HTTP handler gives strong consistency but risks provider timeout and retries. We either process in-process (and accept timeout risk) or validate (HMAC + idempotency) synchronously, then enqueue for processing—trading fast 200 to the provider for eventual consistency and more moving parts. We chose based on provider SLA and our need for retries and dead-letter control.
2. **Modular monolith vs many services.** Single deploy and DB reduce operational and consistency complexity; we paid with strict boundary discipline (no cross-domain DB access, explicit contracts between contexts). Splitting out payments or catalog would have improved isolation but added distributed failure modes and transactions; for our team size and traffic we kept one runtime.
3. **Pessimistic vs optimistic locking for inventory.** We used `SELECT ... FOR UPDATE` on the slot so only one reservation wins. Simpler to reason about and operate at our contention level; at much higher concurrency we'd revisit with optimistic locking or a dedicated inventory service.
4. **Catalog eventual consistency vs strong.** Reservations use the normalized catalog as of sync time; we don't block booking on "latest from provider." That keeps reservation flow fast and resilient to provider slowness; we accept that catalog can lag and validate at booking time against what we have.

**Failure scenarios and handling**

- **Webhook replayed or forged:** HMAC verification on raw body; constant-time compare. Invalid signature → 401, no side effects, no persistence. Event idempotency ensures that a replayed valid payload is applied once.
- **Webhook delivered multiple times (provider retry):** We store processed `event_id`s per provider. Duplicate event_id → 200, no duplicate payment or duplicate reservation state update.
- **Payment recorded but reservation not updated (process crash):** Payment and reservation updates are in a single DB transaction where possible. If we use a queue, the worker is idempotent by event_id so retries don't double-apply; we design so that "payment succeeded" is applied exactly once and reservation moves to paid once.
- **Provider unavailable during checkout:** Client and backend retry with backoff; idempotency key on reservation creation prevents duplicate bookings on retry. Payment intent is created when we can talk to the provider; webhook is the only path to "paid."
- **Catalog sync failure or provider 4xx:** Sync jobs retry with exponential backoff; we don't retry business 4xx. Reservations use last-known-good catalog; we don't block on "latest" from provider. Clear ownership of canonical Activity model and mapping table so we know what we're booking against.
- **Global promotion limit overshoot:** Claim of a coupon use (increment or "use" of limit) is done in the same transaction as reservation creation, with constraint or lock so the limit cannot be exceeded under concurrency.

**Consistency model**

- **Reservation and payment:** Strong consistency where we can: payment state and reservation state (e.g. to `paid`) updated in one DB transaction. If processing is queued after webhook acceptance, we rely on idempotency (event_id) and retries so the system eventually converges to "payment recorded once, reservation paid once."
- **Catalog:** Eventual. Sync runs in jobs; reservations and search use the current normalized view. We validate at booking time and do not block on real-time provider read.
- **Promotion limits:** Strong within the transaction that creates the reservation and claims the coupon use; no overshoot of global limits.

**Scale assumptions**

- Single database; no cross-DC write replication. Pessimistic lock on inventory is acceptable for our booking concurrency; we'd revisit if contention became high.
- Webhook throughput bounded by provider retry policy and our processing (sync or queue). We don't assume infinite webhook rate; we size workers and queues and monitor.
- Catalog sync is chunked and job-based; we don't assume real-time sync of all providers. Designed for "many activities, many providers" at tourism-platform scale, not global catalog at hyperscale.

---


## What I’d stress in an interview

- **Single source of truth for “paid”:** webhook-only. No client path to mark a reservation as paid.  
- **Defense in depth on webhooks:** HMAC (authenticity), event_id (idempotency), single DB transaction or careful retry design (consistency).  
- **Idempotency keys on reservation creation** so retries and double-submits don’t create duplicate bookings.  
- **Explicit state machines** for reservation and payment so invalid transitions are rejected in the domain.  
- **Modular monolith** as a deliberate trade-off: clear boundaries and testability without the operational cost of many services.  
- **Concurrency handled where it matters:** pessimistic lock on inventory for reservation creation; transactional “claim” for promotion global limits.

That’s how we kept the system consistent, auditable, and operable in production.
