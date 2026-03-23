# Municipal unified login — Backend engineering case study

*Written as a senior engineer explaining the system in a technical interview. Focus: security architecture, trust boundaries, identity validation, trade-offs in government infrastructure.*

---

## Recruiter preview — summary, decisions, risks, auth architecture

**Summary (70 words)**  
Centralized authentication gateway for a municipality: citizens authenticate once and access multiple government services with a single token. Identity is validated against national registries (Mi Argentina, RENAPER, AFIP) on every login; the gateway is the only component that calls those APIs and the only issuer of session tokens. Legacy systems consume signed tokens and enforce RBAC; they do not re-authenticate. Trust boundaries: no PII in tokens; fail safe when national APIs are down. Audit and RBAC in two layers (gateway + service).

**5 key architectural decisions**  
1. Gateway as sole identity validator and token issuer; legacy systems only validate token signature and claims.  
2. Identity validation on every login; no long-lived cache of "verified" status; never issue "verified" token when validation failed.  
3. No PII in tokens (internal id, roles, entitlements only); national APIs and raw identity data stay in the gateway.  
4. RBAC at gateway (at issuance) and at each service (per resource); service never trusts the client, only the signed token.  
5. Gateway-centric integration: new services accept token in header; legacy systems via proxy/session translator, with gateway as single entry path.

**3 security risks mitigated**  
1. **Forged or replayed identity:** Only the gateway calls RENAPER/AFIP; tokens are signed; services verify signature and expiry—no "frontend said they're user X."  
2. **Token leakage / PII exposure:** Tokens carry minimal claims (id, roles, entitlements); no DNI or raw registry data in tokens; limits blast radius.  
3. **Legacy auth bypass:** Legacy systems do not perform auth; they consume gateway-issued tokens. Gateway-mediated sessions for cookie-only systems are audited and gateway is the only citizen entry path.

**Authentication architecture (1 sentence)**  
Citizen authenticates at a centralized gateway, which validates identity against national registries (RENAPER, Mi Argentina, AFIP), then issues short-lived signed tokens; downstream services validate the token and apply RBAC—no re-authentication, single source of truth for identity at the gateway.

---

## What we built and why it’s non-trivial

We built a **centralized authentication gateway** for a municipality: citizens authenticate once and then access multiple government services—permits, taxes, records, etc.—without logging in again. Each service is a separate system, often legacy, with its own history and constraints. The challenge was to introduce a **single identity layer** without rewriting every backend: one login, one place where we validate who the citizen is, and then tokens that downstream services can trust. So the core problems were **trust boundaries** (who validates identity, who issues tokens, who consumes them), **identity validation** against national sources (Mi Argentina, RENAPER, AFIP), and **integration with legacy systems** that were never designed for federated auth.

Government context adds hard constraints: **audit everything**, minimize what we store and transmit, comply with data-protection and access rules, and deal with **availability of external APIs** (RENAPER, AFIP) that we don’t control. So we had to design for failure of those validations, clear security boundaries, and scalability so the gateway doesn’t become a single point of failure for the whole citizen experience.

---

## Trust boundaries

The first decision was **where we draw trust boundaries**.

**We do not trust:**  
- The browser or mobile app with identity data beyond what’s needed for the session.  
- Legacy backends to perform authentication; they were never the source of truth for “who is this citizen?”  
- Any system that hasn’t validated the user in this session; we don’t pass through “the frontend said they’re user X.”

**We do trust (after verification):**  
- Our **central gateway** as the only issuer of session tokens after a successful auth + identity-validation flow.  
- **National identity providers** (Mi Argentina, RENAPER, AFIP) as the source of truth for “this person exists and these attributes are correct,” when we call them and get a successful, validated response.  
- **Downstream services** only to consume tokens we issued and to validate signature and claims; they don’t re-authenticate the user, they trust the gateway’s token.

So the flow is: **citizen → gateway (auth + identity validation) → token issued by gateway → legacy service validates token and uses claims**. The gateway is the only component that talks to Mi Argentina, RENAPER, AFIP for identity; downstream services never see raw identity data from those systems, only what we put in the token (e.g. normalized identifier, role hints, minimal attributes). That’s **data minimization** and a clear boundary: national APIs and PII stay in the gateway; services get only what they need to authorize the request.

---

## Identity validation flow

Identity validation is the critical path. The citizen has already authenticated (e.g. username/password, or integration with a provincial/national SSO if available). Then we need to **prove** that the authenticated account corresponds to a real person in RENAPER and, where required, that we can cross-check with Mi Argentina or AFIP (e.g. tax status, eligibility for a benefit). So the flow is:

1. **Authentication:** User proves they control an account (credentials or federated IdP). We establish a session at the gateway.  
2. **Identity resolution:** We call RENAPER (and/or Mi Argentina, AFIP) with the identifiers we’re allowed to send (e.g. DNI, or token from Mi Argentina), and we get back attributes we need (existence, name, status).  
3. **Binding:** We bind the authenticated session to that resolved identity. If validation fails (API down, mismatch, or not found), we don’t issue a full session; we fail safe and optionally show a clear message or retry path.  
4. **Token issuance:** We issue a signed token (e.g. JWT) containing only the claims that downstream services need: internal user id, role(s), service entitlements, and maybe a stable opaque identifier—no raw RENAPER/AFIP data in the token.  
5. **Consumption:** Each legacy service receives the token (e.g. in a header), validates the signature (using the gateway’s public key or shared secret), checks expiry and audience, and uses claims for **RBAC** (role-based access control): “this token has role citizen and requested resource X; allow or deny.”

We had to decide **when** we call RENAPER/AFIP: on every login, or once and then cache. We did validation on **every login** and cached the result only for the lifetime of that session (or a short TTL) so that revocations or status changes (e.g. tax status) don’t stick around forever. Trade-off: more calls to national APIs, but stronger guarantee that “logged in” means “currently valid according to the registry.” If RENAPER or AFIP is down, we don’t issue a full token; we either show “identity verification temporarily unavailable” or fall back to a degraded mode (e.g. limited services) depending on policy. **We never issue a token that says “identity verified” if we couldn’t actually verify.**

---

## Security architecture decisions

**Token-based auth:** Sessions are represented by signed tokens (e.g. JWT). The gateway signs them with a key that only it holds; downstream services verify with the public key or a shared secret. So services don’t need to call the gateway on every request; they can validate the token locally. Trade-off: revocation is harder (we’d need short expiry, refresh tokens, or a revocation list). We used **short-lived access tokens** and optional refresh tokens so we can invalidate sessions at the gateway and stop issuing new tokens; already-issued tokens expire soon.

**No PII in tokens:** Tokens carry a stable internal id, roles, and entitlements—not DNI, not full name from RENAPER, unless a service has a justified need and we document it. That limits blast radius if a token is leaked and aligns with data minimization.

**RBAC at the gateway and at the service:** The gateway can enforce “this user has role X” before issuing a token (e.g. only citizens get a citizen token). Each service then does **authorization** again: “for this resource, does this token’s role/claims allow access?” So we have two layers: gateway says “this is a valid session for this identity and these roles”; service says “this role can access this endpoint.” The service never trusts the client; it trusts the signed token and applies its own RBAC rules.

**Centralized auth gateway:** All login and identity-validation traffic goes through one component (or a small set of instances behind a load balancer). That gives us a single place to audit logins, failures, and identity checks, and to enforce rate limiting and abuse detection. The trade-off is **single point of failure**: if the gateway is down, nobody logs in. We addressed that with redundancy, health checks, and clear ops runbooks; we did not decentralize auth back into legacy systems because that would have blurred trust boundaries and made audit and compliance much harder.

---

## Integration with legacy systems

Legacy systems didn’t speak OAuth or OIDC; many had their own login screens and session cookies. We had two integration patterns:

1. **Token in header:** Newer or adaptable backends accept a header (e.g. `Authorization: Bearer <token>`), validate the token, and read claims for RBAC. We provided a small SDK or middleware that does signature verification and injects user/role into the request context so the app doesn’t have to parse JWTs by hand.  
2. **Gateway as proxy or session translator:** For systems that could only do “redirect to login and get a cookie,” the gateway could act as the login page: user hits the gateway, completes auth and identity validation, and the gateway then calls the legacy system’s login API (if it had one) or sets a legacy session cookie on behalf of the user after verifying the citizen. That’s sensitive: the gateway must be the only path into that legacy system for citizen traffic, and we had to audit that flow carefully so we weren’t delegating trust to a weak legacy auth.

We avoided storing legacy passwords or replicating legacy user tables. **Single source of truth for identity** is the gateway plus national APIs; legacy systems become **consumers** of that identity via tokens or gateway-mediated sessions.

---

## Trade-offs in government infrastructure

**Availability of national APIs:** RENAPER, AFIP, Mi Argentina can be slow or down. We couldn’t block all logins when that happens. So we defined **degraded modes**: e.g. “identity verification unavailable, only pre-verified sessions can continue” or “access to a subset of services that don’t require fresh RENAPER check.” We documented this in policy and in runbooks so support and citizens know what to expect.

**Audit and compliance:** Every login attempt, every identity validation (success and failure), and every token issuance is logged in a way that’s suitable for audit. We don’t log full PII in plain text; we log enough to correlate (e.g. internal id, timestamp, outcome, which service). Retention and access to those logs follow government and data-protection rules.

**Legacy and pace of change:** We couldn’t rewrite every backend. So we chose a **gateway-centric** model: new and updated services integrate via tokens; legacy systems integrate via proxy or adapter. That allowed incremental rollout and kept trust boundaries clear while the rest of the estate caught up.

**Scalability and security:** The gateway is stateful in the sense that it issues tokens and may hold refresh tokens or session references. We scaled it horizontally behind a load balancer with shared or distributed session storage if needed. Security-wise, we treated the gateway as **high-value target**: hardened config, secrets in a vault, no unnecessary ports, and regular review of who can deploy and change auth logic.

---

## Design Tradeoffs & Failure Modes

**Tradeoffs**

1. **Gateway as single identity validator vs single point of failure.** Centralizing auth gives one audit surface and clear trust boundaries, but gateway outage blocks all logins. We accepted the SPoF and mitigated with horizontal redundancy, health checks, and runbooks; we did not push auth back into legacy systems.
2. **Validation on every login vs national API load and latency.** We chose fresh validation each login (with at most session-scoped cache) so "logged in" implies "currently valid according to registry." Trade-off: more RENAPER/AFIP/Mi Argentina calls and dependency on their availability; we never issue a "verified" token when validation failed or was skipped.
3. **Short-lived tokens vs revocation.** Stateless verification at services avoids a gateway call per request but makes instant revocation hard. We used short-lived access tokens and optional refresh; revocation is "stop issuing new tokens" plus expiry of in-flight tokens—no distributed revocation list.
4. **No PII in tokens vs service needs.** Tokens carry only id, roles, entitlements. Services that need raw identity for display or compliance get it via a separate, audited gateway call or never; we kept blast radius and token size small.

**Failure scenarios and handling**

- **National APIs (RENAPER, AFIP, Mi Argentina) down or slow:** We do not issue a full "identity verified" token. User sees "identity verification temporarily unavailable" or we enter a documented degraded mode (e.g. only pre-verified sessions continue, or subset of services). No silent fallback to "verified" when we didn't verify.
- **Gateway down:** All new logins fail; existing tokens remain valid until expiry. Mitigation: multiple instances behind a load balancer, shared session/refresh storage, and ops procedures to restore or fail over.
- **Token leaked:** Short TTL limits window; no PII in token limits impact. Revocation is via refresh invalidation and waiting for access token expiry; we did not implement a real-time revocation list.
- **Legacy system misbehaving or compromised:** Services only trust the signed token and apply RBAC; they never re-authenticate. Compromised legacy cannot issue or forge gateway tokens; gateway is the only path for citizen auth into legacy (proxy/session translator) and that path is audited.

**Consistency model**

- **Identity view:** Strong within a session—we validate once per login and bind session to that result; no long-lived cache of "verified" across sessions. If we couldn't validate, we don't claim verified.
- **Token validity:** Services see an eventually consistent view of "revoked": after we stop issuing refresh tokens, in-flight access tokens remain valid until they expire; we rely on short TTL rather than synchronous revocation.

**Scale assumptions**

- Gateway scales horizontally behind a load balancer; session/refresh state in shared or distributed store so any instance can validate refresh and issue access tokens.
- Rate limiting and abuse detection at the gateway; national API call volume bounded by login rate and retry policy.
- No assumption of infinite scale; designed for municipality-level citizen load with headroom and monitoring to add capacity or throttle if needed.

---


## What I’d stress in an interview

- **Trust boundaries:** Gateway is the only identity validator and token issuer; legacy systems consume tokens and don’t re-authenticate. National APIs (RENAPER, AFIP, Mi Argentina) are the source of truth for identity; we validate on every login and don’t issue “verified” tokens when validation failed or wasn’t done.  
- **Data minimization:** Tokens carry only what each service needs (id, roles, entitlements); we don’t put raw RENAPER/AFIP data in tokens.  
- **RBAC in two layers:** Gateway enforces role at issuance; each service enforces authorization per resource using token claims.  
- **Failure mode:** When national APIs are down, we fail safe (no full token or degraded mode), and we don’t pretend we verified when we didn’t.  
- **Audit and ops:** Centralized gateway gives one place to log, rate-limit, and secure auth; trade-off is single point of failure, mitigated by redundancy and clear ownership.

That’s how we kept the system secure, auditable, and integrable with legacy government systems.

---

## 6 soundbites para entrevista (identity, security, tokens, cross-system, data protection)

1. **Identity validation:** “Validamos identidad contra RENAPER, Mi Argentina y AFIP en cada login; el resultado solo se cachea para la vida de la sesión. Nunca emitimos un token que diga ‘identidad verificada’ si no pudimos verificar.”

2. **Security boundaries:** “El gateway es el único que valida identidad y emite tokens; los servicios legacy solo consumen el token y verifican firma y claims. No confiamos en el cliente ni en los legacy para autenticar.”

3. **Token management:** “Tokens firmados por el gateway; servicios verifican con clave pública o secreto compartido y no llaman al gateway en cada request. Usamos access tokens de vida corta y refresh opcional para poder invalidar sesiones sin depender de una revocation list.”

4. **Cross-system authentication:** “Un solo login en el gateway; después el ciudadano accede a múltiples servicios municipales con el mismo token. Los legacy no re-autentican: validan el token y aplican RBAC con los claims.”

5. **Data protection:** “No ponemos PII de RENAPER o AFIP en el token; solo id interno, roles y entitlements. Las APIs nacionales y los datos sensibles se quedan en el gateway; los servicios reciben solo lo necesario para autorizar.”

6. **Failure and audit:** “Si RENAPER o AFIP están caídos, no emitimos token de identidad verificada; mostramos modo degradado o ‘verificación no disponible’. Todo intento de login y validación se registra para auditoría, sin PII en texto plano en los logs.”
