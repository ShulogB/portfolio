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
  /** Traducciones ES — cuando lang=es se usan si existen, si no fallback a EN. */
  titleEs?: string;
  techEs?: string;
  overviewEs?: string;
  adrsEs?: AdrLink[];
  scaleConstraintsEs?: ScaleConstraints;
  rejectedApproachesEs?: RejectedApproach[];
  whatWouldBreakEs?: string[];
  deepDiveEs?: DeepDiveSection[];
};

const patagoniaDreams: Project = {
  slug: "patagonia-dreams",
  title: "Transactional Booking & Payment Platform",
  tech: "Payments • Webhooks • Concurrency",
  overview:
    "Backend for Patagonia Dreams — a tourism operator with 180k+ passengers/year and 7,000+ five-star Google reviews. Built and led the platform from scratch: transactional reservations and payments (Mercado Pago, Stripe, Pix), multi-tenant backoffice, and bidirectional sync with an external activity panel. The core invariant: a reservation is only 'paid' when the webhook confirms it — never based on client state. Webhooks are HMAC-validated and processed idempotently by event_id. Availability is locked pessimistically (SELECT FOR UPDATE) to serialize concurrent bookings on the same slot. Identity via AWS Cognito with JWKS token verification; all critical config from AWS Secrets Manager. Stack: Django, DRF, PostgreSQL, AWS (SES, Cognito, Secrets Manager, ECR/K8s).",
  diagramType: "payments",
  adrs: [
    { title: "Webhooks as single source of truth for payment status — client redirect cannot set 'paid'", href: "#" },
    { title: "Pessimistic locking (SELECT FOR UPDATE) on availability slot — concurrent bookings serialize, not race", href: "#" },
    { title: "Idempotency keys on reservation creation; event_id deduplication on all incoming webhooks", href: "#" },
    { title: "HMAC validation on every webhook payload before processing", href: "#" },
    { title: "AWS Cognito as sole identity entry point; ID token verified with JWKS before trusting any user data", href: "#" },
    { title: "All critical config via AWS Secrets Manager — no secrets in code or repo", href: "#" },
  ],
  adrsEs: [
    { title: "Webhooks como única fuente de verdad del estado de pago — el redirect del cliente no puede setear 'pagado'", href: "#" },
    { title: "Bloqueo pesimista (SELECT FOR UPDATE) en el slot de disponibilidad — las reservas concurrentes se serializan, no compiten", href: "#" },
    { title: "Claves de idempotencia en creación de reservas; deduplicación por event_id en todos los webhooks entrantes", href: "#" },
    { title: "Validación HMAC en cada payload de webhook antes de procesarlo", href: "#" },
    { title: "AWS Cognito como único punto de entrada de identidad; ID token verificado con JWKS antes de confiar en datos del usuario", href: "#" },
    { title: "Toda la config crítica via AWS Secrets Manager — sin secrets en código ni repo", href: "#" },
  ],
  scaleConstraints: {
    requestVolume: "Operator with 180k+ passengers/year. Online platform reservations + webhook bursts up to ~50/min on peak.",
    concurrency: "Pessimistic lock on availability row per slot; single writer for payment state. No cross-slot locking.",
    externalDependencies: "Mercado Pago, Stripe, Pix (payments); external activity Panel (availability, rates, and bidirectional booking sync); AWS Cognito, SES, Secrets Manager; Google (OAuth, My Business, Merchant Center); Meta. Webhooks are async; payment status only via webhook.",
    failureModes: "Provider timeout or webhook delay → reservation stays pending until webhook or manual reconciliation. Duplicate webhook → idempotent by event_id. Cognito/Panel down → degraded auth or catalog sync.",
    dataConsistency: "Single DB transaction for reservation + payment on webhook. Reservation \"paid\" only after webhook; frontend cannot set paid. Cognito ↔ Django user sync via get_or_create and ID token verification.",
  },
  scaleConstraintsEs: {
    requestVolume: "Operadora con +180k pasajeros/año. Reservas en plataforma online + bursts de webhooks hasta ~50/min en pico.",
    concurrency: "Lock pesimista en la fila de disponibilidad por slot; único escritor para el estado de pago. Sin locking cruzado entre slots.",
    externalDependencies: "Mercado Pago, Stripe, Pix (pagos); Panel externo de actividades (disponibilidad, tarifas y sync bidireccional de reservas); AWS Cognito, SES, Secrets Manager; Google (OAuth, My Business, Merchant Center); Meta. Los webhooks son asíncronos; el estado de pago solo llega por webhook.",
    failureModes: "Timeout o demora del proveedor → la reserva queda pendiente hasta el webhook o reconciliación manual. Webhook duplicado → idempotente por event_id. Cognito/Panel caídos → auth degradada o sync de catálogo interrumpida.",
    dataConsistency: "Una transacción DB para reserva + pago en el webhook. Reserva 'pagada' solo tras webhook; el frontend no puede setear pagado. Sync Cognito ↔ Django via get_or_create y verificación de ID token.",
  },
  rejectedApproaches: [
    { approach: "Frontend or redirect callback as source of \"paid\"", reason: "Redirects and client state are unreliable; provider retries and multiple tabs would allow double-apply or missed updates." },
    { approach: "Optimistic locking on availability", reason: "Conflict rate on hot slots would cause high retry and poor UX; pessimistic lock gave predictable behaviour at observed load." },
    { approach: "Microservices per domain (payments, reservations, catalog)", reason: "Operational and consistency cost (distributed transactions, eventual consistency) not justified for current scale; modular monolith with clear boundaries chosen instead." },
    { approach: "CSV export for operations", reason: "Excel/CSV formula injection risk; replaced with JSON response and controlled data only." },
    { approach: "Secrets or sensitive URLs in code or repo", reason: "All critical config (FRONTEND_URL, Cognito, Stripe, Panel, etc.) via env from AWS Secrets Manager." },
  ],
  rejectedApproachesEs: [
    { approach: "Frontend o redirect callback como fuente de 'pagado'", reason: "Los redirects y el estado del cliente son poco confiables; los reintentos del proveedor y múltiples pestañas permitirían doble aplicación o actualizaciones perdidas." },
    { approach: "Bloqueo optimista en disponibilidad", reason: "La tasa de conflictos en slots muy demandados generaría muchos reintentos y mala UX; el lock pesimista dio comportamiento predecible al load observado." },
    { approach: "Microservicios por dominio (pagos, reservas, catálogo)", reason: "El costo operacional y de consistencia (transacciones distribuidas, consistencia eventual) no se justifica al scale actual; se eligió monolito modular con fronteras claras." },
    { approach: "Export CSV para operaciones", reason: "Riesgo de inyección de fórmulas Excel/CSV; reemplazado por respuesta JSON con datos controlados." },
    { approach: "Secrets o URLs sensibles en código o repo", reason: "Toda la config crítica (FRONTEND_URL, Cognito, Stripe, Panel, etc.) via env desde AWS Secrets Manager." },
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
  whatWouldBreakEs: [
    "Falla de DB única o réplica: todo el estado de reservas y pagos en un solo store; sin failover automático.",
    "Entrega de webhooks interrumpida (proveedor o nuestro endpoint): las reservas quedan pendientes indefinidamente; sin camino a 'pagado'.",
    "Contención de lock en slots calientes: SELECT FOR UPDATE serializa; a mayor concurrencia crecen los tiempos de espera y los timeouts.",
    "Crecimiento ilimitado de la tabla de claves de idempotencia: el cleanup falla o se retrasa → bloat en la tabla y búsquedas más lentas.",
    "Mercado Pago, Stripe y Pix todos degradados: sin camino para confirmar el pago; el negocio se detiene.",
    "Proveedor de catálogo con datos incorrectos o caído: inventario desactualizado; overbooking si la disponibilidad externa es autoritativa.",
    "Cognito no disponible: sin signup/login ni refresh de token; la identidad es un único punto de entrada.",
    "Secrets Manager o configuración de env incorrecta: las integraciones de auth o pago fallan en runtime.",
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
        "Development follows a structured flow: feature branches → CI checks (linting, security scans) → PR review → merge to production. No direct pushes to the production branch.",
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
      title: "External integrations and infrastructure",
      paragraphs: [
        "The platform integrates bidirectionally with an external activity panel: availability and pricing are pulled in real time before a booking is confirmed; once confirmed, the reservation is automatically injected back into the panel via API. This keeps both systems consistent without manual intervention and without coupling the reservation flow to panel response time.",
        "Google integrations cover OAuth 2.0 for authentication, My Business API for review management, and Merchant Center for product feed automation. Meta and Watti integrations handle marketing and customer communication automation. Amazon SES manages all transactional emails with parameterized templates and URL validation before dispatch.",
        "Infrastructure runs on AWS (EC2, ALB, Route 53, ACM/SSL, Cognito, SES, Secrets Manager, ECR/K8s) with Docker across dev, staging, and production. All sensitive configuration is loaded from AWS Secrets Manager at runtime — no secrets in code or repo.",
        "Development follows a structured flow: feature branches → CI checks (linting, security scans) → PR review → merge to production. No direct pushes to the production branch.",
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
  deepDiveEs: [
    {
      title: "Identidad y auth (límites de confianza)",
      paragraphs: [
        "AWS Cognito es el único punto de entrada para identidad: signup, confirmación de email, login usuario/contraseña, refresh de token y callback OAuth Authorization Code para Hosted UI.",
        "Sync bidireccional Cognito ↔ Django: get_or_create por email, generación de username único ante colisión, actualización de nombres y estado activo desde ID token verificado (JWKS, issuer, audience, exp). SECRET_HASH se usa correctamente en todas las llamadas a Cognito que lo requieren (sign_up, confirm_sign_up, authenticate, refresh_token) para clientes confidenciales, evitando errores de configuración en producción.",
        "El ID token se verifica con JWKS (RS256, issuer, audience) antes de confiar en cualquier dato del usuario; sin verificación no se crea ni actualiza el usuario local.",
      ],
    },
    {
      title: "Flujos de pago y transaccionales",
      paragraphs: [
        "Flujos de confirmación de pago y reserva: emails transaccionales (AWS SES) con datos de reserva, pasajeros, actividades y links seguros; templates parametrizados solo con contexto controlado (reserva, actividades).",
        "Integración con Panel externo (actividades, tarifas, bloqueos) y mapeo Panel actividad ↔ actividad local, con export de datos para operaciones y reportes.",
        "Transacciones atómicas (transaction.atomic()) en creación/actualización de reservas y mapeos para mantener consistencia ante fallos o concurrencia.",
      ],
    },
    {
      title: "Seguridad y límites de confianza",
      paragraphs: [
        "Vectores de inyección eliminados: export CSV reemplazado por respuesta JSON para evitar inyección de fórmulas Excel/CSV; validación de URL en templates de email (filtro http_url: solo http/https) para prevenir XSS via javascript: en href.",
        "Secrets fuera del código: config crítica (FRONTEND_URL, WHATSAPP_NUMBER, URLs sociales, Cognito, Stripe, Panel, etc.) via variables de entorno desde AWS Secrets Manager; sin valores sensibles en el repo.",
        "El desarrollo sigue un flujo estructurado: ramas de feature → CI checks (linting, escaneos de seguridad) → PR review → merge a producción. Sin pushes directos a la rama de producción.",
      ],
    },
    {
      title: "Concurrencia y corrección",
      paragraphs: [
        "Idempotencia y unicidad: get_or_create y lógica de 'registro único' (ej. Layouts, mapeos) para evitar duplicados y race conditions en escrituras.",
        "Transacciones explícitas en flujos que tocan múltiples modelos (reserva + usuario + notificaciones) para garantizar todo-o-nada y consistencia ante fallos.",
        "Integración con APIs externas (Panel, Cognito) con timeouts y manejo de errores para que el proceso no se bloquee y no confiemos en respuestas malformadas.",
      ],
    },
    {
      title: "Integraciones externas e infraestructura",
      paragraphs: [
        "La plataforma se integra bidireccionalmente con un panel externo de actividades: disponibilidad y precios se consultan en tiempo real antes de confirmar una reserva; una vez confirmada, la reserva se inyecta automáticamente de vuelta al panel via API. Esto mantiene ambos sistemas consistentes sin intervención manual y sin acoplar el flujo de reservas al tiempo de respuesta del panel.",
        "Las integraciones con Google cubren OAuth 2.0 para autenticación, My Business API para gestión de reseñas y Merchant Center para automatización del feed de productos. Las integraciones con Meta y Watti manejan automatización de marketing y comunicación con clientes. Amazon SES gestiona todos los emails transaccionales con templates parametrizados y validación de URL antes del envío.",
        "La infraestructura corre en AWS (EC2, ALB, Route 53, ACM/SSL, Cognito, SES, Secrets Manager, ECR/K8s) con Docker en dev, staging y producción. Toda la configuración sensible se carga desde AWS Secrets Manager en runtime — sin secrets en código ni repo.",
        "El desarrollo sigue un flujo estructurado: ramas de feature → CI checks (linting, escaneos de seguridad) → PR review → merge a producción. Sin pushes directos a la rama de producción.",
      ],
    },
    {
      title: "Idempotencia en pagos distribuidos",
      paragraphs: [
        "Los proveedores de pago y los webhooks entregan al menos una vez. Los reintentos, particiones de red y dobles envíos del cliente hacen que los eventos duplicados sean la norma. La idempotencia está implementada en dos capas distintas: operaciones iniciadas por el cliente (ej. creación de reserva) y eventos del servidor (webhooks).",
        "Para operaciones del cliente usamos una clave de idempotencia (provista por el cliente o derivada de un hash determinístico de la intención). La clave es la única lookup para el resultado almacenado; la primera request ejecuta y persiste el resultado, las siguientes devuelven el resultado almacenado sin re-ejecutar. Diseño clave: almacenar el resultado (éxito/fallo + payload de respuesta o código de error), no solo 'visto'. Eso permite replay seguro con semántica correcta.",
        "Para webhooks, la clave es event_id (o id del proveedor). El mismo event_id puede entregarse múltiples veces; aplicamos la transición de estado una vez e ignoramos los duplicados. Crítico: el check de idempotencia y la actualización de estado (ej. marcar reserva pagada) están en la misma transacción para nunca doble-aplicar bajo concurrencia. Políticas de expiración y limpieza de claves previenen el crecimiento ilimitado mientras retienen claves suficiente tiempo para cubrir las ventanas de reintento del proveedor (ej. 24–72h).",
      ],
    },
    {
      title: "Transiciones de estado atómicas y race conditions",
      paragraphs: [
        "El doble booking ocurre cuando dos requests concurrentes ambos leen 'disponible' y luego ambos hacen commit de una reserva. La solución es un único escritor y serialización en el límite de consistencia. Usamos SELECT FOR UPDATE en la fila de disponibilidad dentro de la misma transacción que crea la reserva. La segunda request se bloquea hasta que la primera hace commit o rollback; luego ve el estado actualizado y tiene éxito en la capacidad restante o falla consistentemente.",
        "Cuando la transición abarca dos stores (ej. registro de pago y reserva), los mantenemos en una transacción DB donde ambas tablas están en la misma base de datos. El commit crea el registro de pago y actualiza la reserva en un paso atómico. Cuando el pago es externo (webhook del proveedor), tratamos el webhook como la fuente de verdad para 'pagado' y actualizamos nuestra reserva en una transacción local única con clave en event_id idempotente; el único escritor para esa transición es el handler del webhook.",
        "Evitamos transacciones compensatorias estilo saga para el path principal: agregan complejidad y nuevos modos de fallo. Donde debemos coordinar entre servicios, usamos un outbox o una escritura única que dispara trabajo downstream, con consumidores idempotentes para que los eventos duplicados no doble-apliquen.",
      ],
    },
  ],
  externalUrl: "https://patagoniadreams.com.ar",
  titleEs: "Plataforma transaccional de reservas y pagos",
  techEs: "Pagos • Webhooks • Concurrencia",
  overviewEs:
    "Backend para Patagonia Dreams — operadora de turismo con +180k pasajeros/año y 7.000+ reseñas cinco estrellas en Google. Construí y lideré la plataforma desde cero: reservas y pagos transaccionales (Mercado Pago, Stripe, Pix), backoffice multi-tenant y sync bidireccional con un panel externo de actividades. El invariante central: una reserva solo está 'pagada' cuando el webhook lo confirma — nunca basado en el estado del cliente. Los webhooks se validan con HMAC y se procesan de forma idempotente por event_id. La disponibilidad se bloquea de forma pesimista (SELECT FOR UPDATE) para serializar reservas concurrentes en el mismo slot. Identidad via AWS Cognito con verificación de token JWKS; toda la config crítica desde AWS Secrets Manager. Stack: Django, DRF, PostgreSQL, AWS (SES, Cognito, Secrets Manager, ECR/K8s).",
};

const municipalIdentity: Project = {
  slug: "municipal-identity",
  title: "Municipal Unified Identity Platform",
  tech: "Identity • Trust Boundaries • RBAC",
  overview:
    "Centralized SSO-style authentication gateway for the Municipality of Bahía Blanca (autentica.bahia.gob.ar): citizens authenticate once and access 10+ critical municipal services with a single token. ~15k logins/month, 2 years uninterrupted in production. Identity is validated against national registries — ARCA, ANSES, RENAPER, and Mi Argentina — on every login; the gateway is the sole component that calls those APIs and the sole issuer of session tokens. Legacy systems consume signed tokens and enforce RBAC; they never re-authenticate. No PII in tokens; fail safe when national APIs are unavailable. Audit and RBAC at gateway and service layer.",
  diagramType: "identity",
  adrs: [
    { title: "Gateway as sole issuer of session tokens; legacy systems validate only", href: "#" },
    { title: "No PII in tokens; minimal claims for authorization", href: "#" },
    { title: "Fail safe when national identity APIs are unavailable", href: "#" },
    { title: "RBAC enforced at gateway and at service layer", href: "#" },
    { title: "Audit logging for authentication and token issuance", href: "#" },
  ],
  adrsEs: [
    { title: "Gateway como único emisor de tokens de sesión; sistemas legacy solo validan", href: "#" },
    { title: "Sin PII en tokens; claims mínimos para autorización", href: "#" },
    { title: "Fail safe cuando las APIs nacionales de identidad no están disponibles", href: "#" },
    { title: "RBAC aplicado en gateway y en capa de servicio", href: "#" },
    { title: "Auditoría de autenticación y emisión de tokens", href: "#" },
  ],
  scaleConstraints: {
    requestVolume: "~45k logins/month; token validation on every request to downstream services.",
    concurrency: "Gateway is single writer for tokens; services are read-only validators. No distributed lock; stateless validation.",
    externalDependencies: "Mi Argentina, RENAPER, ARCA. Login depends on at least one being available; degraded mode (unverified session or reject) when all are down.",
    failureModes: "National APIs down or slow → degraded mode or login failure; no \"verified\" issued without verification. Token validation failure → 401; no fallback to legacy auth.",
    dataConsistency: "Session and verification state only in gateway; tokens are signed assertions. Services do not persist identity state; they validate and apply RBAC per request.",
  },
  scaleConstraintsEs: {
    requestVolume: "~45k logins/mes; validación de token en cada request a servicios downstream.",
    concurrency: "El gateway es el único escritor de tokens; los servicios son solo validadores. Sin lock distribuido; validación stateless.",
    externalDependencies: "Mi Argentina, RENAPER, ARCA. El login depende de que al menos uno esté disponible; modo degradado (sesión no verificada o rechazo) cuando todos están caídos.",
    failureModes: "APIs nacionales caídas o lentas → modo degradado o fallo de login; sin 'verificado' emitido sin verificación. Fallo de validación de token → 401; sin fallback a auth legacy.",
    dataConsistency: "Estado de sesión y verificación solo en el gateway; los tokens son aserciones firmadas. Los servicios no persisten estado de identidad; validan y aplican RBAC por request.",
  },
  rejectedApproaches: [
    { approach: "Each legacy system calling national APIs and issuing its own tokens", reason: "Would duplicate integration, PII exposure, and failure modes; single gateway gives one trust boundary and one place to fail safe." },
    { approach: "PII or raw registry data in tokens", reason: "Blast radius and compliance; tokens are minimal claims (sub, roles, exp) so compromise of a service does not leak registry data." },
    { approach: "Long-lived tokens with no re-validation", reason: "Verification must reflect current state; every login re-validates against national APIs so \"verified\" cannot become stale." },
  ],
  rejectedApproachesEs: [
    { approach: "Cada sistema legacy llamando a APIs nacionales y emitiendo sus propios tokens", reason: "Duplicaría integración, exposición de PII y modos de fallo; un único gateway da un límite de confianza y un único punto de fail safe." },
    { approach: "PII o datos crudos de registros en tokens", reason: "Radio de daño y compliance; los tokens son claims mínimos (sub, roles, exp) para que el compromiso de un servicio no filtre datos de registros." },
    { approach: "Tokens de larga vida sin re-validación", reason: "La verificación debe reflejar el estado actual; cada login re-valida contra las APIs nacionales para que 'verificado' no quede desactualizado." },
  ],
  whatWouldBreak: [
    "Gateway down: no one logs in; single point of failure for all services.",
    "RENAPER, ARCA, Mi Argentina all unavailable: only unverified sessions or login failure; no degradation that preserves \"verified\".",
    "Token signing key compromise: all tokens forgeable until rotation; services must reject old key and all sessions invalidated.",
    "DB holding session/audit state lost: session revocation and audit trail gap; no point-in-time recovery of who had access.",
    "Sudden 10x login spike: national APIs and gateway become bottleneck; external dependencies do not scale with us.",
    "Legacy service skips RBAC or misvalidates token: authorization bypass; boundary is only as strong as the weakest consumer.",
  ],
  whatWouldBreakEs: [
    "Gateway caído: nadie puede loguearse; único punto de fallo para todos los servicios.",
    "RENAPER, ARCA, Mi Argentina todos no disponibles: solo sesiones no verificadas o fallo de login; sin degradación que preserve 'verificado'.",
    "Compromiso de clave de firma de tokens: todos los tokens son falsificables hasta la rotación; los servicios deben rechazar la clave vieja y todas las sesiones son invalidadas.",
    "DB con estado de sesión/auditoría perdida: brecha en revocación de sesiones y audit trail; sin recuperación point-in-time de quién tuvo acceso.",
    "Spike repentino de logins x10: las APIs nacionales y el gateway se convierten en cuello de botella; las dependencias externas no escalan con nosotros.",
    "Servicio legacy que omite RBAC o valida mal el token: bypass de autorización; el límite es tan fuerte como el consumidor más débil.",
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
  deepDiveEs: [
    {
      title: "Diseño de tokens y límites de confianza",
      paragraphs: [
        "El gateway es el único componente que llama a los proveedores de identidad (APIs nacionales, etc.) y el único emisor de tokens de sesión. Los servicios downstream validan tokens y aplican RBAC; nunca re-autentican. Eso define un límite de confianza claro: todo lo que está detrás del gateway confía en la emisión del gateway y trata el token como autoridad para identidad y claims.",
        "Los tokens llevan claims mínimos: id de identidad, roles, scope, expiración. Sin PII, sin datos crudos de registros. Eso limita el radio de daño ante filtración de token y mantiene claros los límites de compliance (el PII queda en el sistema que lo posee). Usamos tokens firmados (ej. JWT con HMAC o firma asimétrica); los validadores verifican firma y expiración y rechazan todo lo demás. Los tokens opacos con lookup server-side son una alternativa cuando la revocación debe ser inmediata y global.",
        "La revocación se maneja en el gateway (invalidación de sesión, logout). Los servicios downstream dependen de tokens de corta vida o re-validación periódica si se requiere 'logout en todos lados' estricto sin un store de revocación compartido.",
      ],
    },
    {
      title: "Estrategia de logging de auditoría",
      paragraphs: [
        "Registramos acciones que cambian estado con quién (id de actor o servicio), qué (tipo de acción, id de recurso), cuándo (timestamp), y contexto suficiente para reproducir (ej. clave de idempotencia, event_id, id de entidad creada/actualizada). Los logs son append-only e inmutables; sin ediciones in-place. Eso soporta compliance y análisis post-incidente.",
        "Campos estructurados (JSON o key-value) permiten consultar por correlation_id, request_id o user_id. Los correlation IDs se propagan entre límites de servicio para que un pago o login se pueda rastrear desde el gateway hasta la escritura en DB. La retención es por política: corta para logs de debug ruidosos, más larga para auditoría y eventos relacionados con pagos.",
        "Los datos sensibles no se loguean en texto plano; registramos identificadores y tipos de evento, no PII completo ni datos de tarjeta. Los logs de auditoría se escriben síncronamente en el path crítico para no perder eventos ante un crash; mantenemos el payload pequeño y la escritura rápida (ej. a una tabla dedicada o stream de logs).",
      ],
    },
    {
      title: "Observabilidad y detección de fallos",
      paragraphs: [
        "Los health checks están separados: liveness (proceso arriba) vs readiness (dependencias aceptables). Un servicio que no puede llegar a la DB o a un proveedor de identidad debería fallar readiness para que el orquestador no envíe tráfico hasta que se recupere. Evitamos marcarnos healthy cuando no podemos cumplir requests.",
        "Instrumentamos los flujos de pago e identidad con métricas: latencia (p50/p99), tasa de error por outcome (ej. éxito, duplicado idempotente, fallo de validación), y tasa de hits de idempotencia. Las alertas disparan ante tasa de error elevada, fallos de dependencias (ej. API nacional caída) y fallos en el procesamiento de webhooks de pago. Los dashboards muestran éxito vs duplicado vs fallo para distinguir reintentos de regresiones reales.",
        "El tracing distribuido (trace_id entre servicios) conecta un request desde la API por la cola y la DB. Cuando falla un pago o login, se puede seguir el mismo trace_id en logs y trazas. La detección de fallos no es solo 'servicio caído' sino 'teniendo éxito con semántica degradada' — alertamos cuando no podemos verificar identidad y estamos sirviendo sesiones no verificadas, para que la decisión de degradar sea explícita y visible.",
      ],
    },
  ],
  externalUrl: "https://autentica.bahia.gob.ar",
  titleEs: "Plataforma municipal de identidad unificada",
  techEs: "Identidad • Límites de confianza • RBAC",
  overviewEs:
    "Gateway de autenticación estilo SSO para el Municipio de Bahía Blanca (autentica.bahia.gob.ar): los ciudadanos se autentican una vez y acceden a 10+ servicios municipales críticos con un único token. ~15k logins/mes, 2 años en producción ininterrumpida. La identidad se valida contra registros nacionales — ARCA, ANSES, RENAPER y Mi Argentina — en cada login; el gateway es el único componente que llama esas APIs y el único emisor de tokens de sesión. Sistemas legacy consumen tokens firmados y aplican RBAC; no re-autentican. Sin PII en tokens; fail safe cuando las APIs nacionales no están disponibles. Auditoría y RBAC en gateway y capa de servicio.",
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
  adrsEs: [
    { title: "Clave de idempotencia requerida para todas las solicitudes de inicio de pago", href: "#" },
    { title: "Outbox para llamadas a proveedores; sin efectos secundarios en el ciclo del request", href: "#" },
    { title: "Procesamiento de webhooks idempotente por event_id del proveedor", href: "#" },
    { title: "Límites de transacción: una transacción DB por transición de estado", href: "#" },
    { title: "Reconciliación y manejo de modos de falla", href: "#" },
  ],
  scaleConstraints: {
    requestVolume: "Client and provider retries; requests and webhooks can arrive duplicated or out of order.",
    concurrency: "Single writer per idempotency key; outbox for provider calls. No double charge under retries.",
    externalDependencies: "Payment provider API; webhooks. Network failures between DB commit and provider call possible.",
    failureModes: "Provider timeout or unreachable after commit → outbox retry. Duplicate webhook → idempotent by event_id. Client retry → same key returns stored outcome.",
    dataConsistency: "Payment state and outbox in same DB; commit before provider call or outbox. No double charge; idempotency key is sole source of outcome for request.",
  },
  scaleConstraintsEs: {
    requestVolume: "Reintentos del cliente y del proveedor; requests y webhooks pueden llegar duplicados o fuera de orden.",
    concurrency: "Único escritor por clave de idempotencia; outbox para llamadas al proveedor. Sin doble cobro bajo reintentos.",
    externalDependencies: "API del proveedor de pago; webhooks. Posibles fallos de red entre el commit en DB y la llamada al proveedor.",
    failureModes: "Timeout o proveedor inalcanzable tras el commit → reintento por outbox. Webhook duplicado → idempotente por event_id. Reintento del cliente → la misma clave devuelve el resultado almacenado.",
    dataConsistency: "Estado de pago y outbox en la misma DB; commit antes de la llamada al proveedor o al outbox. Sin doble cobro; la clave de idempotencia es la única fuente de resultado para el request.",
  },
  rejectedApproaches: [
    { approach: "Simple request-based processing without idempotency keys", reason: "Retries and duplicate submissions would cause double charge; key at business layer is required." },
    { approach: "Handling retries only at HTTP layer", reason: "Application state can still double-apply; idempotency must be enforced at orchestration layer with a stable key." },
    { approach: "Relying entirely on provider guarantees", reason: "Provider semantics vary and may not guarantee exactly-once; we own the no-double-charge guarantee." },
    { approach: "Processing side effects inside request lifecycle", reason: "If process dies after DB commit but before provider call, state is inconsistent; outbox decouples and allows retry without re-executing request." },
  ],
  rejectedApproachesEs: [
    { approach: "Procesamiento simple por request sin claves de idempotencia", reason: "Los reintentos y envíos duplicados causarían doble cobro; la clave a nivel de negocio es obligatoria." },
    { approach: "Manejar reintentos solo en la capa HTTP", reason: "El estado de la aplicación puede igualmente doble-aplicarse; la idempotencia debe aplicarse en la capa de orquestación con una clave estable." },
    { approach: "Depender enteramente de las garantías del proveedor", reason: "La semántica de los proveedores varía y puede no garantizar exactly-once; nosotros somos dueños de la garantía de no doble cobro." },
    { approach: "Procesar efectos secundarios dentro del ciclo del request", reason: "Si el proceso muere tras el commit en DB pero antes de la llamada al proveedor, el estado es inconsistente; el outbox desacopla y permite reintento sin re-ejecutar el request." },
  ],
  whatWouldBreak: [
    "Outbox worker stopped: payments committed in DB never reach provider; state stuck, money never charged.",
    "Provider accepts charge but never sends webhook: we may never mark succeeded; reconciliation depends on manual or batch check.",
    "Idempotency key reused for different intents: wrong outcome returned; key must be per intent.",
    "Provider eventually consistent: we mark paid on webhook; provider may still show pending; read-your-writes violation for downstream.",
    "Worker retries outbox row without provider idempotency: double charge if provider does not deduplicate by our key.",
  ],
  whatWouldBreakEs: [
    "Worker del outbox detenido: los pagos comprometidos en DB nunca llegan al proveedor; estado bloqueado, dinero nunca cobrado.",
    "El proveedor acepta el cobro pero nunca envía webhook: es posible que nunca marquemos como exitoso; la reconciliación depende de una verificación manual o por lote.",
    "Clave de idempotencia reutilizada para intenciones distintas: se devuelve el resultado incorrecto; la clave debe ser por intención.",
    "Proveedor eventualmente consistente: marcamos pagado en el webhook; el proveedor puede seguir mostrando pendiente; violación de read-your-writes para downstream.",
    "Worker reintenta fila del outbox sin idempotencia del proveedor: doble cobro si el proveedor no deduplica por nuestra clave.",
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
        "We do not guarantee that the provider is called in the same second as the commit; we guarantee that every committed outbox row is eventually processed. The worker retries until the provider accepts or we mark failed after a threshold. Local state (payment + outbox) is consistent after each transaction; provider state catches up when the worker succeeds.",
      ],
    },
    {
      title: "Webhook Reconciliation",
      paragraphs: [
        "We persist every webhook event in a table keyed by provider event_id (or equivalent). Before applying any transition we check whether that event_id is already stored; if so we skip (deduplicate). If not we apply the transition (e.g. payment succeeded) and store the event_id in the same transaction. Duplicate webhooks for the same event_id are no-ops.",
        "Deduplication is by provider event_id only. We do not key by our internal id; the provider can send the same event multiple times. First occurrence wins; later ones are ignored. Order of arrival does not change the outcome because the state machine is deterministic and we only move forward.",
        "We reconcile webhook-derived state with the local state machine. If the worker already updated state from a successful provider call, the webhook may be redundant; we still store the event_id and treat as idempotent duplicate. Reconciliation job can compare our state to provider state for aged pending items and alert or retry.",
      ],
    },
    {
      title: "Failure Mode Analysis",
      paragraphs: [
        "Crash after DB commit but before provider call: we never call the provider in the request; we only write the outbox row. After restart the worker picks up the pending row and dispatches. The provider is called once when the worker runs. No double charge because only the worker performs the call and it marks the row processed after success.",
        "Provider returns success but client times out: the client may retry with the same idempotency key. We return the stored outcome (success) without re-executing. The charge already happened; the retry is a read.",
        "Worker crash during dispatch: the worker calls the provider then must mark the outbox row processed. If the worker crashes after the provider call but before marking processed, on restart it will retry the same row. The provider receives a second call with the same idempotency key; the provider must deduplicate. Alternatively we mark 'dispatching' before the call and only set 'processed' after; retries skip rows already in 'dispatching' for longer than a timeout.",
      ],
    },
  ],
  deepDiveEs: [
    {
      title: "Estrategia de idempotencia",
      paragraphs: [
        "Cada request de inicio de pago debe llevar una clave de idempotencia (provista por el cliente o derivada de la intención). La clave es la única lookup para el resultado almacenado. La primera request con una clave dada crea la fila de pago y ejecuta la máquina de estados; las siguientes con la misma clave devuelven el resultado almacenado sin re-ejecutar. Almacenamos el resultado (éxito/fallo más respuesta o código de error), no solo 'visto', para que el replay devuelva el mismo resultado.",
        "Un constraint único en (client_id, idempotency_key) en la base de datos fuerza una fila por clave. Requests concurrentes con la misma clave: uno inserta y avanza; los otros chocan con el constraint y o bien reintentan la lectura o se tratan como duplicado. Sin lock a nivel de aplicación; el constraint es el punto de serialización.",
        "El estado del pago es una máquina de estados basada en status (ej. pending → charge_requested → provider_called → succeeded, o failed). Las transiciones son deterministas y se almacenan en una transacción. La misma clave siempre da el mismo estado terminal; nunca se transiciona de failed a succeeded ni se crea un segundo cobro.",
      ],
    },
    {
      title: "Límites de transacción",
      paragraphs: [
        "Cada transición de estado es una transacción atómica en la base de datos. Insertamos o actualizamos la fila de pago y, cuando necesitamos llamar al proveedor, insertamos una fila en el outbox en la misma transacción. El commit ocurre antes de cualquier llamada HTTP al proveedor. Si hiciéramos commit y luego llamáramos al proveedor en el mismo proceso, un crash tras el commit pero antes de la llamada dejaría nuestra DB actualizada pero el proveedor nunca llamado; la fila del outbox garantiza que un worker en background realizará la llamada más tarde.",
        "La llamada al proveedor externo debe estar fuera del commit porque el proveedor no es parte de la transacción. No podemos hacer rollback de un cobro al proveedor si nuestro commit falla. Por eso nunca hacemos: commit y luego llamar al proveedor en el request. Hacemos: commit (estado + fila del outbox) y retornar; el worker llama al proveedor y actualiza el estado en una transacción separada.",
        "La doble ejecución se previene por la clave de idempotencia en el límite del request (misma clave → mismo resultado almacenado) y por el constraint único (una fila por clave). El worker despacha cada fila del outbox como máximo una vez en la práctica; si reintenta, la llamada al proveedor usa la misma clave de idempotencia para que el proveedor no doble-cobre.",
      ],
    },
    {
      title: "Implementación del patrón outbox",
      paragraphs: [
        "Usamos una tabla outbox dedicada: columnas incluyen id, payment_id, payload, status (pending/processed/failed), created_at, processed_at. Cuando se transiciona el pago a 'charge requested', insertamos una fila en el outbox en la misma transacción. Ningún otro efecto secundario se ejecuta en ese request.",
        "Un worker en background hace polling del outbox por filas pendientes (o se notifica por una cola). Carga la fila, llama al proveedor con el payload y la clave de idempotencia, y en éxito marca la fila como procesada y actualiza el estado del pago en una transacción. Ante fallo o timeout del proveedor, deja la fila pendiente y reintenta con backoff.",
        "No garantizamos que el proveedor sea llamado en el mismo segundo que el commit; garantizamos que cada fila del outbox comprometida se procese eventualmente. El worker reintenta hasta que el proveedor acepta o marcamos como fallido tras un umbral. El estado local (pago + outbox) es consistente tras cada transacción; el estado del proveedor se pone al día cuando el worker tiene éxito.",
      ],
    },
    {
      title: "Reconciliación de webhooks",
      paragraphs: [
        "Persistimos cada evento de webhook en una tabla con clave por event_id del proveedor. Antes de aplicar cualquier transición verificamos si ese event_id ya está almacenado; si es así, omitimos (deduplicamos). Si no, aplicamos la transición (ej. pago exitoso) y almacenamos el event_id en la misma transacción. Los webhooks duplicados para el mismo event_id son no-ops.",
        "La deduplicación es solo por event_id del proveedor. No usamos nuestra id interna; el proveedor puede enviar el mismo evento múltiples veces. El primero gana; los siguientes se ignoran. El orden de llegada no cambia el resultado porque la máquina de estados es determinista y solo avanza.",
        "Reconciliamos el estado derivado de webhooks con la máquina de estados local. Si el worker ya actualizó el estado desde una llamada exitosa al proveedor, el webhook puede ser redundante; igual almacenamos el event_id y tratamos como duplicado idempotente. Un job de reconciliación puede comparar nuestro estado con el del proveedor para ítems pendientes envejecidos y alertar o reintentar.",
      ],
    },
    {
      title: "Análisis de modos de falla",
      paragraphs: [
        "Crash tras commit en DB pero antes de llamar al proveedor: nunca llamamos al proveedor en el request; solo escribimos la fila del outbox. Tras el reinicio el worker levanta la fila pendiente y la despacha. El proveedor se llama una vez cuando el worker corre. Sin doble cobro porque solo el worker realiza la llamada y marca la fila como procesada tras el éxito.",
        "El proveedor devuelve éxito pero el cliente hace timeout: el cliente puede reintentar con la misma clave de idempotencia. Devolvemos el resultado almacenado (éxito) sin re-ejecutar. El cobro ya ocurrió; el reintento es una lectura.",
        "Crash del worker durante el despacho: el worker llama al proveedor y luego debe marcar la fila del outbox como procesada. Si el worker hace crash tras la llamada al proveedor pero antes de marcar como procesada, al reiniciar reintentará la misma fila. El proveedor recibe una segunda llamada con la misma clave de idempotencia; el proveedor debe deduplicar. Alternativamente marcamos 'dispatching' antes de la llamada y solo seteamos 'processed' después; los reintentos omiten filas ya en 'dispatching' por más de un timeout.",
      ],
    },
  ],
  externalUrl: "#",
  titleEs: "Orquestador de pagos idempotente",
  techEs: "Arquitectura backend • Sistemas transaccionales",
  overviewEs:
    "Diseñé e implementé un proceso de pagos seguro para reintentos con estrictas garantías de idempotencia bajo envíos concurrentes. Claves de idempotencia en el request; outbox para llamadas al proveedor; reconciliación por webhook con event_id. Garantía: sin doble cobro ante reintentos del cliente, webhooks duplicados o falla de red entre commit en DB y llamada al proveedor.",
};

const projects: Project[] = [patagoniaDreams, municipalIdentity, paymentOrchestrator];

export function getProjectBySlug(slug: string): Project | null {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function getAllProjectSlugs(): ProjectSlug[] {
  return projects.map((p) => p.slug);
}
