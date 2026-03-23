# Documentación técnica — Patagonia Dreams

Documentación de ingeniería del sistema. Orientada a reclutadores técnicos backend.

---

## Recruiter preview (70 words) + decisiones, riesgos, diagrama

**Preview (70 palabras)**  
Plataforma de reservas turísticas en producción. Backoffice multi-módulo y multi-tenant (partners y clientes). Pagos con Mercado Pago, Stripe y Pix; webhooks como única fuente de verdad para “reserva pagada”, con validación HMAC e idempotencia por event_id. Idempotency keys en creación de reservas; motor de promociones con claims transaccionales; normalización de catálogo con proveedores externos. Monolito modular, Docker, CI/CD, AWS. Enfoque en integridad transaccional y seguridad en pagos.

**5 decisiones arquitectónicas clave**  
1. Monolito modular con bounded contexts (reservas, pagos, promociones, catálogo, reviews); comunicación por interfaces.  
2. Reserva pagada solo vía webhook validado; frontend no actualiza estado de pago.  
3. Idempotency keys en creación de reserva; idempotencia por event_id en webhooks.  
4. Bloqueo pesimista (SELECT FOR UPDATE) en disponibilidad al crear reserva.  
5. Motor de promociones como subdominio; claim de cupos globales en la misma transacción que la reserva.

**3 riesgos de producción mitigados**  
1. **Doble reserva / doble pago:** idempotency keys en create-reservation; event_id en webhooks; rechazo de eventos ya procesados.  
2. **Overselling de inventario:** SELECT FOR UPDATE del slot dentro de la transacción de creación de reserva.  
3. **Inconsistencia reserva–pago:** actualización de estado de pago y de reserva en una sola transacción de BD; única fuente de verdad = webhook.

**Diagrama de arquitectura (descripción textual)**  
Cliente → API (controladores) → servicios de aplicación → dominio. Infra: BD, clientes HTTP a gateways de pago, colas/jobs. Gateways de pago (Mercado Pago, Stripe) envían webhooks → endpoint dedicado (valida HMAC, event_id) → procesamiento en proceso o cola → actualiza transacción y reserva. Sync de catálogo y reviews vía jobs/colas. Todo en contenedores; CI/CD a AWS.

---

## Resumen ejecutivo (recruiters)

Patagonia Dreams es una plataforma de reservas turísticas en producción con backoffice multi-módulo, multi-tenant (partners y clientes finales), motor de promociones (cupones, ofertas, flash deals) e integración con Mercado Pago, Stripe y Pix. El backend es un monolito modular con capas API / aplicación / dominio / infra; la fuente de verdad para “reserva pagada” son los webhooks de pago validados por firma HMAC e idempotencia por `event_id`. Incluye normalización y sincronización de actividades con proveedores externos, automatización de respuestas a Google Reviews, Docker y CI/CD con GitHub Actions sobre AWS.

---

## Modal (1 pantalla) — copiar en UI

**Párrafo (máx. 90 palabras)**  
Patagonia Dreams es una plataforma de reservas turísticas en producción: backoffice multi-módulo, roles (admin, partner, cliente), motor de promociones (cupones, ofertas, flash deals) y pagos con Mercado Pago, Stripe y Pix. El estado “reserva pagada” solo se actualiza desde webhooks validados (HMAC + idempotencia por event_id). Incluye idempotency keys en creación de reservas, máquinas de estado explícitas, normalización de catálogo con proveedores externos y respuestas automáticas a Google Reviews. Stack: Docker, GitHub Actions, AWS (Cognito).

**5 bullets (1 línea cada uno)**  
- Webhooks como única fuente de verdad para pago; validación HMAC e idempotencia por `event_id`.  
- Idempotency keys en creación de reservas para evitar doble reserva en retries.  
- Monolito modular con fronteras de dominio (reservas, pagos, promociones, catálogo, reviews).  
- Multi-tenant con tenant scoping por `partner_id`; autorización en backend, no en cliente.  
- Normalización de actividades (mapeo interno–proveedor) y sync eventual por jobs/chunks.

**Arquitectura (1 oración)**  
Backend monolito modular (API → aplicación → dominio → infra), integraciones vía webhooks (pagos) y jobs/colas (catálogo, reviews), desplegado en contenedores con CI/CD sobre AWS.

---

## 8 soundbites para entrevista técnica (1–2 frases cada uno)

1. **Fuente de verdad para “pagado”:** “La única forma en que una reserva pasa a pagada es cuando el módulo de pagos lo indica tras validar un webhook. El frontend nunca actualiza estado de pago; no confiamos en el redirect ni en el cliente.”

2. **Webhooks en profundidad:** “Validamos HMAC sobre el body raw antes de tocar nada; si la firma falla devolvemos 401 y no persistimos ni encolamos. Luego idempotencia por event_id para que los reintentos del proveedor no dupliquen efectos.”

3. **Idempotency keys en reservas:** “El endpoint de crear reserva acepta una idempotency key; la primera request ejecuta el flujo y guarda la respuesta, las siguientes con la misma key devuelven esa respuesta sin re-ejecutar. Así un solo ‘create’ lógico se traduce en una sola reserva.”

4. **State machines:** “Reserva y transacción de pago tienen máquinas de estado explícitas en dominio; las transiciones inválidas las rechazamos en la API. Evita cambios de estado ‘mágicos’ y deja claro qué puede pasar desde cada estado.”

5. **Monolito modular:** “Elegimos monolito modular frente a microservicios: fronteras de dominio claras y comunicación por interfaces, sin referencias cruzadas. Evolucionamos por módulos sin el coste operativo de muchos servicios y redes.”

6. **Concurrencia en inventario:** “Para evitar overselling cuando varias requests reservaban el mismo slot usamos SELECT FOR UPDATE en la fila de disponibilidad dentro de la transacción que crea la reserva. Con nuestro nivel de conflicto el lock pesimista era más simple de operar que optimistic locking.”

7. **Promociones y límites globales:** “El motor de promociones es un subdominio: recibe carrito o borrador de reserva y devuelve descuentos; no conoce pagos ni proveedores. Los cupos globales los ‘claimamos’ en la misma transacción que la reserva, con constraint o lock, para no superar el máximo bajo concurrencia.”

8. **Pago y reserva atómicos:** “Cuando procesamos ‘pago exitoso’ actualizamos el estado de la transacción de pago y el de la reserva en la misma transacción de BD. No queremos que quede pago en succeeded y reserva en pending_payment porque el proceso murió en el medio.”

---

## Condensado para CV / modal

**Executive summary (4 líneas)**  
Plataforma de reservas turísticas en producción: backoffice multi-módulo, roles (admin, partner, cliente), promociones dinámicas y pagos vía Mercado Pago, Stripe y Pix. Monolito modular; webhooks como única fuente de verdad para estado de pago; validación HMAC e idempotencia en eventos. Normalización de catálogo con proveedores externos, respuestas automáticas a reviews, Docker + GitHub Actions + AWS.

**Complejidad de ingeniería (6 bullets)**  
- Monolito modular con fronteras de dominio claras (reservas, pagos, promociones, catálogo, reviews); comunicación por interfaces, no por referencias cruzadas.  
- Multi-tenant con tenant scoping consistente por `partner_id`; autorización en capa de aplicación, no delegada al cliente.  
- Máquina de estados explícita en reservas y en transacciones de pago; transiciones acotadas y rechazo de inválidas.  
- Idempotency keys en creación de reservas (tabla `idempotency_keys`) y por `event_id` en webhooks para evitar doble reserva y doble aplicación de pago.  
- Motor de promociones como subdominio aislado (recibe carrito/reserva, devuelve descuentos); reglas con prioridad y concurrencia controlada en cupos globales.  
- Normalización de actividades con tabla de mapeo `activity_provider_mapping` y sync eventual por jobs/chunks; retry con backoff en clientes HTTP y en workers.

**Pagos e integridad transaccional (4 bullets)**  
- Webhooks como única fuente de verdad para “reserva pagada”; el frontend no actualiza estado de pago.  
- Validación de firma HMAC (body raw + secreto) antes de procesar; comparación en tiempo constante; rechazo 401 si no coincide.  
- Idempotencia por `event_id` en tabla de eventos procesados; reintentos del proveedor no duplican efectos.  
- Transacción de BD que actualiza estado de pago y estado de reserva en un solo commit; retry con backoff (o cola + worker) en procesamiento de webhook para no bloquear respuesta al gateway.

**Decisiones de diseño (3 bullets)**  
- Monolito modular frente a microservicios: evolución por módulos y pruebas por capas sin operar despliegues distribuidos ni redes entre servicios.  
- Reserva pagada solo vía webhook validado: elimina flujos que confiaban en redirect del usuario o polling y evita manipulación de estado sin pago real.  
- Bloqueo pesimista (SELECT FOR UPDATE) en disponibilidad al crear reserva: bajo conflicto esperado y simplicidad operativa frente a optimistic locking.

---

## 1. Arquitectura general del sistema

El backend se organiza como **monolito modular**: una única aplicación desplegable con fronteras de dominio explícitas. Cada módulo (reservas, pagos, promociones, catálogo, reviews) tiene su propio conjunto de entidades, servicios de aplicación y contratos de API; la comunicación entre módulos es por interfaces bien definidas, no por referencias directas a implementaciones de otro dominio. Esto permite evolución independiente y pruebas por capas sin comprometer la operación con despliegues distribuidos.

**Capas:**

- **API**: controladores HTTP que validan entrada, resuelven identidad (Cognito) y delegan en servicios de aplicación. No contienen lógica de negocio.
- **Application services**: orquestan casos de uso, coordinan entidades de dominio y transacciones. Un caso de uso = una unidad de trabajo (transacción de BD cuando aplica).
- **Domain**: entidades, value objects y reglas de negocio. Sin dependencias de infraestructura.
- **Infrastructure**: persistencia (ORM/repositorios), clientes HTTP a gateways de pago, colas, jobs. Las interfaces están definidas en dominio o aplicación; la infra las implementa.

**Integraciones externas:** Mercado Pago y Stripe vía webhooks (eventos asíncronos); Pix como método adicional. Google Reviews vía API REST. Sincronización de actividades con proveedores mediante jobs programados y/o colas. Los webhooks se reciben en endpoints dedicados, se valida firma y se encola el procesamiento para no bloquear la respuesta al proveedor.

**Despliegue:** contenedores Docker, orquestación en AWS. CI/CD con GitHub Actions (build, tests, deploy por ambiente). Secretos y configuración por entorno, no en código.

---

## 2. Sistema de roles y permisos

**Modelo de identidad:** AWS Cognito como IdP. Los usuarios (partners y clientes finales) se registran y autentican ahí; el backend recibe JWT en cada request, valida firma y claims y extrae un identificador estable (sub) y atributos opcionales (custom claims para rol o tenant). No se replica el almacén de usuarios en nuestra BD para auth; sí persistimos perfiles y relaciones (partner_id, tenant) para autorización y consultas.

**Roles y alcance:**

- **Admin:** acceso total al backoffice (todas las reservas, usuarios, promociones, reportes). Sin multi-tenant; es un rol global.
- **Partner:** acceso restringido a sus propias actividades, reservas de sus productos y reportes agregados de su negocio. El aislamiento es por `partner_id` (o equivalente) en todas las consultas y comandos; el `partner_id` se resuelve a partir del token o de una tabla de vinculación user_id → partner_id.
- **Cliente final:** solo sus reservas, sus cupones utilizados y su perfil. Aislamiento por `user_id` (sub de Cognito).

**Autorización:** se aplica en la capa de aplicación: antes de ejecutar un caso de uso se comprueba que el sujeto (admin, partner, cliente) tenga permiso sobre el recurso. Para partners se usa **tenant scoping** consistente: cualquier query o comando que toque reservas o actividades filtra por `partner_id` inyectado desde el contexto de seguridad. No se delega esta lógica al cliente; cualquier request que intente acceder a otro tenant devuelve 403.

**Persistencia de permisos:** los roles “admin” y “partner” se pueden mapear vía custom attributes en Cognito o vía tabla en nuestra BD (user_roles, partner_members). La decisión fue centralizar en Cognito los roles básicos para no duplicar estado y mantener un solo lugar de verdad para “quién es quién” en el login.

---

## 3. Flujo de reservas

**Estados del ciclo de vida:** la reserva recorre una máquina de estados explícita. Estados principales: `draft` (cotización o carrito), `pending_payment` (creada, esperando pago), `paid` (pago confirmado), `confirmed` (confirmada con el proveedor/partner), `cancelled`, `completed`. Las transiciones están definidas en dominio (por ejemplo: de `pending_payment` solo se puede ir a `paid`, `cancelled` o, por timeout, a `expired`). El backend no permite transiciones inválidas; cualquier intento se rechaza y se devuelve error claro.

**Creación y concurrencia:** al crear una reserva se verifica disponibilidad y se aplican reglas de negocio (fechas, cupos, plazos). Para evitar **doble reserva** por doble submit del cliente o por reintentos, el endpoint de creación acepta un **idempotency key** (header o cuerpo). Se persiste en una tabla `idempotency_keys` (key, user_id, response_status, response_body_hash, created_at). Primera request con esa key: se ejecuta el flujo, se guarda resultado y se devuelve. Requests posteriores con la misma key: se devuelve la misma respuesta sin re-ejecutar lógica. TTL o limpieza periódica evita crecimiento indefinido. Para actualizaciones (por ejemplo cancelar), se usa key por operación (ej. cancelación por reservation_id + intent).

**Consistencia reserva–pago:** la reserva en `pending_payment` no se considera confirmada hasta que el módulo de pagos notifica (vía evento interno o llamada desde el handler del webhook) que la transacción está en estado final exitoso. Hasta entonces, la reserva puede expirar por tiempo o ser cancelada. El paso a `paid` (y luego a `confirmed`) lo dispara únicamente el flujo de webhooks validado; no el frontend. Así se evita que un cliente manipule el estado sin pago real.

**Transacciones de BD:** las operaciones que modifican reserva + inventario o reserva + pago se ejecutan dentro de transacciones de base de datos con nivel de aislamiento adecuado (por defecto READ COMMITTED; donde hubiera riesgo de race se usan locks optimistas o pesimistas según el caso). Por ejemplo, al confirmar disponibilidad se hace SELECT ... FOR UPDATE en el slot correspondiente o se usa versión en la entidad para optimistic concurrency.

---

## 4. Flujo de pagos con validación de webhooks

**Flujo estándar:** el cliente elige método (Mercado Pago, Stripe, Pix). El backend crea la intención de pago en el gateway correspondiente (preferentemente con idempotency key del lado del proveedor cuando lo soporten) y devuelve URL de checkout o identificador para que el cliente complete el pago. El gateway luego envía uno o varios webhooks con el resultado. Nosotros **no** confiamos en que el cliente vuelva a nuestra página para marcar la reserva como pagada; la fuente de verdad es el webhook.

**Validación de firma (HMAC):** cada request de webhook debe ser autenticado. Mercado Pago y Stripe envían un header con firma (por ejemplo `X-Signature`, `Stripe-Signature`) que es HMAC del payload (body raw) con un secreto compartido. Antes de procesar:

1. Leer el body como raw (no parseado) para recalcular la firma.
2. Obtener el secreto del proveedor desde configuración/secret manager.
3. Calcular HMAC (SHA-256) del body con ese secreto.
4. Comparar con el header de forma segura (comparación constante en tiempo) y rechazar con 401 si no coincide.

Si la firma no es válida, no se persiste ni se encola nada; se responde error y se loguea el intento. Esto mitiga replay y falsificación de eventos.

**Idempotencia en webhooks:** los proveedores pueden reenviar el mismo evento varias veces. Cada evento trae un `id` (o equivalente) que identifica de forma única ese evento. En nuestra tabla de eventos procesados (por ejemplo `payment_events`) guardamos ese `event_id` (y opcionalmente idempotency key si la operación interna la usa). Si ya existe `event_id`, devolvemos 200 sin reprocesar y sin modificar estado. Así evitamos doble aplicación del pago (doble paso de reserva a `paid`, doble acreditación, etc.).

**Estados de transacción:** el modelo de pagos distingue claramente estados: `created`, `pending`, `processing`, `succeeded`, `failed`, `refunded`, `cancelled`. Las transiciones están acotadas; por ejemplo de `succeeded` no se vuelve a `pending`. El webhook actualiza el estado de la transacción y, si pasa a `succeeded`, dispara la lógica que actualiza la reserva a `paid` y emite eventos internos si aplica. Todo dentro de la misma transacción de BD cuando sea posible para que no quede transacción en éxito y reserva aún en `pending_payment`.

**Reintentos (retry):** si el procesamiento del webhook falla (BD caída, timeout a otro servicio), respondemos con 5xx para que el proveedor reintente. La lógica de procesamiento debe ser idempotente (por `event_id`) para que los reintentos no dupliquen efectos. Opcionalmente, después de validar firma y idempotencia, encolamos el payload en una cola interna y respondemos 200 de inmediato; un worker consume la cola con **retry con backoff exponencial** y dead-letter después de N fallos. Así no bloqueamos la respuesta al gateway y controlamos reintentos nosotros.

---

## 5. Motor de promociones dinámicas

**Separación de dominios:** el motor de promociones es un subdominio dentro del bounded context de “ventas”. No conoce detalles de pasarelas de pago ni de proveedores externos; recibe “carrito” o “reserva en borrador” (ítems, precios base, fechas, partner) y devuelve descuentos aplicables y precios finales. La aplicación de la promoción al precio y la persistencia del uso del cupón las orquesta el servicio de aplicación de reservas/pagos, que invoca al motor como una dependencia.

**Tipos de promoción:** (1) Cupones por código: el usuario introduce un código; se valida vigencia, uso máximo por usuario/global y reglas de elegibilidad (producto, categoría, partner, fecha). (2) Ofertas especiales por producto o categoría: aplicadas automáticamente según reglas (por ejemplo “todos los productos de categoría X tienen 10% en este rango de fechas”). (3) Flash deals: ventana temporal corta; mismo modelo de reglas pero con prioridad o tipo específico para no mezclar con ofertas de largo plazo.

**Reglas y prioridad:** las reglas se evalúan en un orden definido (por ejemplo: flash deals primero, luego cupones explícitos, luego ofertas automáticas). Si dos promociones son mutuamente excluyentes por política de negocio, la regla de prioridad o “solo una por reserva” se aplica en el dominio. El motor devuelve la lista de descuentos aplicados y el monto final; no aplica descuentos dos veces sobre el mismo ítem si la regla lo prohíbe.

**Persistencia y auditoría:** cada uso de cupón se registra (reservation_id, user_id, promotion_id, amount_discount, created_at). Así se pueden hacer reportes, límites “N usos por usuario” y auditoría. Los modelos están normalizados: `promotions`, `promotion_rules`, `coupon_redemptions` (o equivalente), sin duplicar datos que ya viven en reservas.

**Concurrencia:** si el cupón tiene “uso máximo global”, al aplicar el descuento se actualiza un contador o se hace una reserva de “cupo” dentro de la misma transacción que crea la reserva, con lock o condición de integridad para no superar el máximo bajo alta concurrencia.

---

## 6. Normalización y sincronización de actividades

**Problema:** las actividades (experiencias, tours) viven en sistemas externos (proveedores, APIs de terceros) y en nuestro catálogo. Nombres, IDs, precios y disponibilidad pueden diferir; necesitamos un modelo unificado para reservas, búsquedas y reporting.

**Modelo normalizado:** se definió una entidad interna `Activity` (o equivalente) con campos estables: id interno (UUID), nombre normalizado, categoría, partner_id, y atributos mínimos necesarios para reserva y precios. Tabla de **mapeo** `activity_provider_mapping`: (internal_activity_id, provider_id, external_id, source_system, last_synced_at, raw_metadata opcional). Un mismo activity interno puede tener varios external_id si varios proveedores ofrecen lo mismo; la decisión de “qué proveedor usar” para una reserva es de negocio y puede estar en otra capa.

**Sincronización:** jobs programados (cron) o workers que consumen colas ejecutan la sincronización: leen de la API del proveedor (o archivos exportados), normalizan a nuestro esquema, actualizan o insertan en `Activity` y en la tabla de mapeo. Estrategia “upsert” por clave externa (provider_id + external_id) para no duplicar actividades. La sincronización es **eventually consistent**; no bloqueamos reservas hasta tener “última versión” del proveedor, pero sí validamos contra lo que tenemos en el momento de la reserva.

**Conflictos y calidad:** si el proveedor devuelve menos campos o cambia formato, la capa de mapeo aplica defaults o reglas de transformación y loguea advertencias. Duplicados (misma actividad con otro external_id) se tratan con reglas de negocio (merge manual o preferencia por una fuente). No se sobrescribe en caliente datos que el usuario haya editado en nuestro backoffice sin una política explícita (por ejemplo “solo ciertos campos se sobrescriben en sync”).

**Retries:** las llamadas a APIs externas usan cliente HTTP con **retry con backoff exponencial** y número máximo de intentos; fallos permanentes (4xx de negocio) no se reintentan. Los jobs de sync pueden escribir estado “last_run_status” para monitoreo y alertas si la sync falla de forma reiterada.

---

## 7. Automatización de respuestas a Google Reviews

**Integración:** uso de la API de Google (My Business / Reviews) para listar reviews y enviar respuestas. Las credenciales (OAuth o service account) se almacenan en secret manager; el backend usa un cliente que renueva tokens si aplica.

**Trigger:** un job periódico (o un webhook si Google lo ofreciera) obtiene reviews nuevas desde la última ejecución. Para cada review se evalúa si debe generarse respuesta automática: por ejemplo todas las de rating ≤ 3, o las que aún no tienen respuesta. Las reglas están parametrizadas (umbral, tipos de negocio, opt-out por partner).

**Lógica de respuesta:** plantillas por tipo (agradecimiento, disculpa por mala experiencia, solicitud de contacto). Se pueden incluir placeholders (nombre del negocio, rating) para personalización. La respuesta se construye en el backend y se envía vía API. Opcionalmente, para ratings muy bajos o palabras clave sensibles, el flujo puede crear un “ticket” para revisión humana en lugar de publicar respuesta automática.

**Límites y cumplimiento:** la API de Google tiene rate limits; el cliente implementa throttling o cola con delay entre llamadas. Las respuestas se guardan en nuestra BD (review_id, response_text, sent_at) para auditoría y para no responder dos veces al mismo review. Si la API devuelve error (límite, rechazo), se aplica **retry con backoff** y se loguea; después de N fallos se deja el ítem para reproceso manual o siguiente ciclo.

**Dominio:** este flujo pertenece a un módulo separado (reviews / reputación); no mezcla con reservas ni pagos. Solo necesita identificación del negocio (partner o lugar) para elegir plantilla y enviar la respuesta.

---

## 8. Problemas técnicos enfrentados y cómo se resolvieron

**Doble aplicación de webhooks (pagos).** Los proveedores reenviaban el mismo evento; sin idempotencia se aplicaba dos veces el pago y la reserva pasaba a “pagada” una sola vez pero se generaban registros duplicados o inconsistencias. **Solución:** tabla de eventos procesados por `event_id` (y provider). Antes de cualquier efecto secundario se comprueba si `event_id` ya existe; si existe se responde 200 y se termina. Procesamiento siempre idempotente por evento.

**Race en disponibilidad al crear reserva.** Varias requests simultáneas para el mismo slot podían obtener “disponible” y todas crear reserva. **Solución:** bloqueo pesimista en el recurso de disponibilidad (SELECT FOR UPDATE del slot o de la fila que representa el inventario) dentro de la transacción que crea la reserva. Alternativa evaluada: optimistic locking con versión en la entidad; se eligió pesimista para este caso por simplicidad operativa y bajo conflicto esperado.

**Inconsistencia reserva “pagada” vs transacción en gateway.** En algún momento la reserva podía marcarse como pagada por flujo distinto al webhook (por ejemplo por polling o por confianza en el redirect del usuario). **Solución:** única fuente de verdad para “reserva pagada”: el handler de webhook validado (firma HMAC + idempotencia). El frontend solo redirige al usuario; el cambio de estado lo hace el backend al recibir el evento. Se eliminaron otros caminos que actualizaban estado de pago.

**Promociones aplicadas dos veces o en combinación no permitida.** Reglas complejas y múltiples evaluaciones permitían superposición de descuentos. **Solución:** motor de promociones con orden de evaluación fijo y política explícita de “una promoción por tipo” o “prioridad por tipo”; persistencia del resultado (qué descuentos se aplicaron) en la reserva y en coupon_redemptions; al recalcular (por ejemplo al editar reserva) se re-ejecuta el motor con las mismas reglas y se reemplaza el resultado anterior en una única transacción.

**Sync de actividades lenta o bloqueante.** Un job que sincronizaba todo en una sola ejecución podía tardar mucho y provocar timeouts o bloqueos. **Solución:** sincronización por lotes (paginación por proveedor), procesamiento en chunks y, donde aplica, cola de mensajes por proveedor o por rango de IDs. Retry por lote fallido sin re-ejecutar los exitosos. Métricas de duración por run para detectar degradación.

**Respuestas a reviews fallando por rate limit.** Envíos masivos a la API de Google generaban 429. **Solución:** cola interna de “reviews pendientes de respuesta”; worker que procesa con delay configurable entre llamadas y respeta códigos 429 (backoff y reencolar). Límite máximo de envíos por ventana de tiempo configurado en aplicación.

---

*Documento técnico — Patagonia Dreams. Redactado con enfoque en decisiones de ingeniería y experiencia en sistemas productivos.*
