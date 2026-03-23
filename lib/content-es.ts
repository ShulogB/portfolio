/**
 * Contenido en español. Cargado bajo demanda en el cliente (dynamic import)
 * cuando el usuario elige idioma ES, para reducir el bundle inicial.
 */
import type { AdrLink, ExperienceSummaryItem, OptimizeForItem, ProductionDecision, TradeoffItem, UILabels } from "./content-types";

const uiEs = {
  hero: { tagline: "Portfolio enfocado en system design", caseStudies: "Estudios de caso", github: "GitHub", linkedin: "LinkedIn", downloadResume: "Descargar CV (PDF)" },
  sections: { home: "Inicio", executiveSnapshot: "Resumen ejecutivo", experienceSummary: "Impacto y experiencia", caseStudies: "Estudios de caso", principles: "Principios de ingeniería", howBuild: "Cómo construyo backends de producción", architectureDeepDive: "Arquitectura y diseño", explicitTradeoffs: "Tradeoffs explícitos", decisions: "Decisiones de ingeniería", stack: "Tecnologías e integraciones", optimizeFor: "Qué optimizo", contact: "Contacto" },
  contact: { name: "Nombre", email: "Email", message: "Mensaje", send: "Enviar", successMessage: "Mensaje enviado. Te responderé pronto.", errorMessage: "No se pudo enviar. Reintentá o escribime por email." },
  caseStudy: { label: "Estudio de caso", scaleConstraints: "Escala y restricciones", rejected: "Qué se rechazó explícitamente", whatWouldBreak: "Qué rompería este sistema?", architectureDecisionRecords: "Architecture Decision Records", architectureAndDecisions: "Arquitectura y decisiones", scaleConstraintsRows: { requestVolume: "Volumen de requests", concurrency: "Concurrencia", externalDependencies: "Dependencias externas", failureModes: "Modos de fallo", dataConsistency: "Consistencia de datos" }, gainedLabel: "Ganado:", sacrificedLabel: "Sacrificado:" },
  footer: "Sistemas backend para producción.",
  adminLogin: "Admin",
  project: { overview: "Resumen", viewLiveSite: "Ver sitio", deepDive: "Profundización", images: "Imágenes" },
} as UILabels;

const es = {
  hero: {
    name: "Giuliano Bentevenga",
    subtitle:
      "Ingeniero backend senior enfocado en sistemas transaccionales, flujos de pago, gateways de identidad y límites de confianza estrictos. Sistemas en producción pensados para corrección bajo concurrencia y fallas.",
    location: "Argentina — abierto a remoto",
    impactLine:
      "Ingeniero backend de producción: reforcé integridad de pagos ante inputs hostiles, migré integraciones a payloads contract-first y operé APIs secure-by-default con límites de confianza claros.",
  },
  principles: [
    { title: "Una única fuente de verdad para estado crítico", description: "Un componente es el único escritor del estado de pago e identidad. El frontend no puede mutar estado transaccional o verificado; los sistemas legacy no autentican. Elimina escritores competidores y confianza del lado cliente en el camino crítico." },
    { title: "Límites de confianza explícitos", description: "Definir quién valida, quién emite, quién consume. El gateway llama a las APIs de identidad y emite tokens; los servicios downstream validan tokens y aplican RBAC y no re-autentican. Límite aplicado en código y contratos." },
    { title: "Idempotencia para eventos reintentables y externos", description: "La creación de reservas y el procesamiento de webhooks son idempotentes por key o event_id. Reintentos y envíos duplicados pasan a ser operaciones seguras en lugar de modos de falla. Los sistemas externos reintentan; el diseño lo asume y no aplica dos veces." },
    { title: "Fail safe cuando la verificación es imposible", description: "Nunca emitir \"verified\" o \"paid\" cuando la verificación o confirmación no tuvo éxito. Si las APIs nacionales o los webhooks de pago no están disponibles, fail safe (modo degradado o error claro) en lugar de relajar la regla." },
    { title: "Actualizaciones atómicas para estado dependiente", description: "Cuando dos estados deben mantenerse sincronizados (ej. transacción de pago y reserva), actualizarlos en una única transacción de base de datos cuando sea posible. Commit de ambos o de ninguno para evitar \"pago exitoso, reserva aún pendiente\"." },
    { title: "Mínimos datos entre fronteras", description: "Tokens y payloads entre servicios llevan solo lo que el consumidor necesita para autorizar o cumplir el request. PII y datos crudos del registro se quedan en el lado que los posee. Limita el blast radius y preserva fronteras de compliance." },
  ],
  executiveSnapshot: [
    "~2k reservas/mes en producción (patagoniadreams.com.ar).",
    "~45k logins/mes en gateway de identidad (autentica.bahia.gob.ar).",
    "99.5% uptime en gateway de identidad en 12 meses.",
    "p95 webhook-a-DB bajo 400 ms; 8+ servicios backend consumen tokens del gateway.",
  ],
  caseStudies: [
    {
      slug: "patagonia-dreams",
      title: "Plataforma transaccional de reservas y pagos",
      tech: "Pagos • Webhooks • Concurrencia",
      preview:
        "Plataforma de reservas turísticas en producción. Backoffice multi-módulo, multi-tenant (socios y clientes finales). Pagos vía Mercado Pago, Stripe, Pix; webhooks como única fuente de verdad de \"reserva pagada\", con validación HMAC e idempotencia por event_id. Claves de idempotencia en creación de reservas; motor de promociones con claims transaccionales; normalización de catálogo con proveedores externos. Monolito modular, Docker, CI/CD, AWS. Integridad transaccional y seguridad de pagos por diseño.",
      diagramType: "payments" as const,
      adrs: [
        { title: "Webhooks como única fuente de verdad del estado de pago", href: "#" },
        { title: "Claves de idempotencia en reservas y event_id en webhooks", href: "#" },
        { title: "Bloqueo pesimista (SELECT FOR UPDATE) para disponibilidad", href: "#" },
        { title: "Monolito modular con fronteras de dominio explícitas", href: "#" },
        { title: "Validación HMAC en todos los payloads de webhook", href: "#" },
      ] as AdrLink[],
    },
    {
      slug: "municipal-identity",
      title: "Plataforma municipal de identidad unificada",
      tech: "Identidad • Límites de confianza • RBAC",
      preview:
        "Gateway de autenticación centralizado para un municipio: los ciudadanos se autentican una vez y acceden a múltiples servicios gubernamentales con un único token. La identidad se valida contra registros nacionales (Mi Argentina, RENAPER, AFIP) en cada login; el gateway es el único componente que llama esas APIs y el único emisor de tokens de sesión. Sistemas legacy consumen tokens firmados y aplican RBAC; no re-autentican. Sin PII en tokens; fail safe cuando las APIs nacionales no están disponibles. Auditoría y RBAC en gateway y capa de servicio.",
      diagramType: "identity" as const,
      adrs: [
        { title: "Gateway como único emisor de tokens; sistemas legacy solo validan", href: "#" },
        { title: "Sin PII en tokens; claims mínimos para autorización", href: "#" },
        { title: "Fail safe cuando las APIs nacionales de identidad no están disponibles", href: "#" },
        { title: "RBAC aplicado en gateway y en capa de servicio", href: "#" },
        { title: "Auditoría de autenticación y emisión de tokens", href: "#" },
      ] as AdrLink[],
    },
    {
      slug: "payment-orchestrator",
      title: "Orquestador de pagos idempotente",
      tech: "Arquitectura backend • Sistemas transaccionales",
      preview:
        "Diseñé e implementé un proceso de procesamiento de pagos seguro para reintentos con estrictas garantías de idempotencia en envíos de transacciones concurrentes.",
      diagramType: "payments" as const,
      adrs: [
        { title: "Clave de idempotencia requerida para todas las solicitudes de pago", href: "#" },
        { title: "Outbox para llamadas a proveedores; sin efectos secundarios en el request", href: "#" },
        { title: "Procesamiento de webhooks idempotente por event_id del proveedor", href: "#" },
        { title: "Transacciones: una transacción DB por transición de estado", href: "#" },
        { title: "Reconciliación y manejo de modos de falla", href: "#" },
      ] as AdrLink[],
    },
  ],
  experienceSummary: [
    { scope: "patagoniadreams.com.ar — disponibilidad de reservas", challenge: "reservas concurrentes para el mismo slot, carrera por marcar pagado", decision: "SELECT FOR UPDATE en la fila de disponibilidad; webhooks como único camino a \"reserva pagada\"", impact: "doble reserva eliminada; ~2k reservas/mes en producción." },
    { scope: "patagoniadreams.com.ar — webhooks de pago", challenge: "payloads duplicados o repetidos, reintentos del proveedor", decision: "Validación HMAC en todos los webhooks; idempotencia por event_id; único escritor del estado de pago", impact: "sin doble aplicación; reintentos seguros; p95 webhook-a-DB bajo 400 ms." },
    { scope: "patagoniadreams.com.ar — creación de reservas", challenge: "envíos duplicados (doble clic, reintentos del cliente)", decision: "Clave de idempotencia por request de creación; constraint único en la key en DB", impact: "reintentos seguros; sin reservas duplicadas." },
    { scope: "patagoniadreams.com.ar — estado de pago y reserva", challenge: "dos estados deben estar sincronizados; el frontend no puede manejar el estado", decision: "Una transacción DB en el webhook: crear/actualizar pago y marcar reserva pagada", impact: "no hay \"pagado\" sin webhook; sin estado partido." },
    { scope: "autentica.bahia.gob.ar — ciclo de vida del token de sesión", challenge: "quién emite, quién valida; evitar PII en tokens", decision: "Gateway único emisor; tokens con solo claims (sub, roles, exp); RBAC en gateway y en cada servicio", impact: "límite de confianza claro; ~45k logins/mes; 99.5% uptime en 12 meses." },
    { scope: "autentica.bahia.gob.ar — verificación de identidad", challenge: "APIs nacionales (RENAPER, AFIP) caídas o alta latencia", decision: "Nunca emitir \"verified\" cuando la verificación no tuvo éxito; modo degradado y alertas cuando las APIs no están", impact: "sin \"verified\" falso; re-validación en cada login." },
    { scope: "autentica.bahia.gob.ar — integración con servicios legacy", challenge: "los sistemas legacy no deben re-autenticar; una sola fuente de identidad", decision: "El gateway emite tokens firmados; los servicios validan firma y aplican RBAC; sin llamadas directas a APIs nacionales", impact: "un solo lugar para identidad; 8+ servicios backend consumen tokens." },
    { scope: "autentica.bahia.gob.ar — autorización y auditoría", challenge: "acceso por rol y recurso entre servicios; quién hizo qué", decision: "RBAC en gateway (nivel ruta) y en servicio (nivel recurso); roles en claims del token; constraints en DB y auditoría para acciones sensibles", impact: "política consistente; trazabilidad para compliance." },
  ] as ExperienceSummaryItem[],
  productionBackends: [
    {
      title: "Integridad de pagos ante inputs hostiles",
      context:
        "El flujo de pagos aceptaba señales controladas por atacante (flags en webhook y precio final enviado por cliente).",
      decision:
        "Validación de firma independiente de flags del request y recálculo/validación server-side de montos en checkout y webhooks.",
      tradeoff:
        "Mayor complejidad de validación y manejo de tolerancias por redondeo.",
      outcome:
        "Cierre de caminos de fraude y prevención de aprobaciones inválidas sobre estado de reserva.",
    },
    {
      title: "Integraciones contract-first sobre parseo textual",
      context:
        "Los datos de transfer viajaban como texto libre, generando ambigüedad y comportamiento frágil aguas abajo.",
      decision:
        "Migración a payload estructurado (kind + trfDetail) con validación condicional estricta y normalización temprana de datos.",
      tradeoff:
        "Más ramas de esquema/validación a mantener entre flujos product/package.",
      outcome:
        "Comportamiento determinista de integración y mejora de calidad de datos end-to-end.",
    },
    {
      title: "Postura API secure-by-default",
      context:
        "Permisos abiertos, errores verbosos y controles inconsistentes elevaban el riesgo de exposición.",
      decision:
        "Defaults globales autenticados, throttling por scope en rutas sensibles y detalle técnico solo en logs internos.",
      tradeoff:
        "Mayor disciplina operativa y ajustes de contrato en algunas respuestas de endpoint.",
      outcome:
        "Reducción de superficie de abuso/exposición de PII y mayor resiliencia ante tráfico ruidoso.",
    },
  ] as ProductionDecision[],
  decisions: [
    "Monolito modular sobre microservicios: fronteras de dominio e interfaces explícitas; menor costo operativo que muchos servicios.",
    "Webhooks como único camino a \"reserva pagada\"; el frontend no puede mutar estado transaccional. Actualizaciones por redirect eliminadas.",
    "Idempotencia en dos capas (creación de reserva por keys, webhooks por event_id) para que reintentos y envíos duplicados sean seguros.",
    "Límites de confianza estrictos en identidad: solo el gateway central llama a las APIs nacionales y emite tokens; los legacy validan tokens y no autentican.",
    "Bloqueo pesimista (SELECT FOR UPDATE) en disponibilidad al crear reserva; doble reserva eliminada en la tasa de conflicto observada.",
    "Identidad validada en cada login; nunca emitir \"verified\" cuando falló la verificación. Modos degradados cuando las APIs nacionales no están.",
  ],
  stack: ["PostgreSQL", "Django REST Framework", "Docker", "CI/CD", "GitHub Actions", "AWS", "Stripe", "Mercado Pago", "Cognito"],
  explicitTradeoffs: [
    { decision: "Webhooks como única fuente de verdad de \"pagado\".", gained: "Ni frontend ni redirect manejan estado; el proveedor es autoridad. Doble aplicación imposible por diseño.", sacrificed: "El usuario espera el webhook; dependemos del envío del proveedor y de nuestro endpoint. No hay \"pagado\" instantáneo desde el redirect." },
    { decision: "Bloqueo pesimista (SELECT FOR UPDATE) en disponibilidad.", gained: "Sin doble reserva; comportamiento determinista en la frontera de consistencia.", sacrificed: "Throughput en slots calientes limitado; contención bajo carga. Sin camino optimista de reintento." },
    { decision: "Monolito modular sobre microservicios.", gained: "Un despliegue, una DB, consistencia transaccional. Menor costo operativo.", sacrificed: "No se pueden escalar dominios por separado. Un bug o deploy afecta todo. Hay que escalar toda la app." },
    { decision: "Gateway como único emisor de tokens; legacy solo validan.", gained: "Una frontera de confianza. Los legacy no tocan APIs de identidad ni PII.", sacrificed: "El gateway es punto único de falla para login. Todo el tráfico de login pasa por un componente." },
    { decision: "Claves de idempotencia en capa de aplicación.", gained: "Reintentos seguros; sin doble cargo ni doble reserva. Duplicados de cliente y webhook son no-ops.", sacrificed: "El cliente debe enviar o derivamos la key; almacenamiento y TTL; más complejidad que fire-and-forget." },
    { decision: "Sin PII en tokens; solo claims mínimos.", gained: "Blast radius limitado si se filtra un token. Frontera de compliance clara.", sacrificed: "Los servicios no pueden mostrar datos de usuario sin llamar al gateway o user store; round-trips o caché extra." },
    { decision: "Escritura de auditoría síncrona en el camino crítico.", gained: "Sin eventos perdidos ante crash. Trazabilidad garantizada.", sacrificed: "Latencia y carga de escritura adicional; el almacenamiento de logs crece. No hay fire-and-forget async para auditoría." },
  ] as TradeoffItem[],
  deepDiveEssays: [
    { title: "Idempotencia en pagos distribuidos", paragraphs: ["Los proveedores de pago y los webhooks entregan al menos una vez. Reintentos, particiones de red y doble envío del cliente hacen que los eventos duplicados sean la norma. La idempotencia se implementa en dos capas: operaciones iniciadas por el cliente (ej. creación de reserva) y eventos del servidor (webhooks).", "Para operaciones del cliente usamos una clave de idempotencia (enviada por el cliente o derivada de un hash determinista de la intención). La clave es la única búsqueda del resultado almacenado; el primer request ejecuta y persiste el resultado, los siguientes devuelven el resultado almacenado sin re-ejecutar. Diseño clave: guardar resultado (éxito/fallo + payload o código de error), no solo \"visto\". Eso permite replay seguro con semántica correcta.", "Para webhooks usamos event_id (o id del proveedor). El mismo event_id puede llegar varias veces; aplicamos la transición de estado una vez e ignoramos duplicados. Crítico: la verificación de idempotencia y la actualización de estado (ej. marcar reserva pagada) viven en la misma transacción para no aplicar dos veces bajo concurrencia. Políticas de expiración y limpieza evitan crecimiento ilimitado manteniendo claves el tiempo suficiente para las ventanas de reintento del proveedor (ej. 24–72h)."] },
    { title: "Transiciones de estado atómicas y condiciones de carrera", paragraphs: ["La doble reserva ocurre cuando dos requests concurrentes leen \"disponible\" y luego confirman una reserva. La solución es un único escritor y serialización en la frontera de consistencia. Usamos SELECT FOR UPDATE en la fila de disponibilidad (o el agregado que la posee) dentro de la misma transacción que crea la reserva. El segundo request espera hasta que el primero haga commit o rollback; luego ve el estado actualizado y tiene éxito en capacidad restante o falla de forma consistente.", "Cuando la transición abarca dos almacenes (ej. registro de pago y reserva), los mantenemos en una transacción DB donde ambas tablas están en la misma base. El commit crea la fila de pago y actualiza la reserva en un paso atómico. Cuando el pago es externo (webhook del proveedor), no tenemos una transacción distribuida única: tratamos el webhook como fuente de verdad de \"pagado\" y actualizamos nuestra reserva en una transacción local keyed por event_id idempotente; el único escritor de esa transición es el handler del webhook.", "Evitamos transacciones compensatorias estilo saga en el camino crítico: añaden complejidad y nuevos modos de falla. Donde debemos coordinar entre servicios, usamos outbox o una única escritura que dispara trabajo downstream, con consumidores idempotentes para que eventos duplicados no se apliquen dos veces."] },
    { title: "Diseño de tokens y fronteras de confianza", paragraphs: ["El gateway es el único componente que llama a proveedores de identidad (APIs nacionales, etc.) y el único emisor de tokens de sesión. Los servicios downstream validan tokens y aplican RBAC; no re-autentican. Eso define una frontera de confianza clara: todo detrás del gateway confía en la emisión del gateway y trata el token como autoridad de identidad y claims.", "Los tokens llevan claims mínimos: id de identidad, roles, scope, expiración. Sin PII, sin datos crudos del registro. Eso limita el blast radius ante filtración de token y mantiene claras las fronteras de compliance (el PII se queda en el sistema que lo posee). Usamos tokens firmados (ej. JWT con HMAC o firma asimétrica); los validadores verifican firma y expiración y rechazan lo demás. Tokens opacos con lookup en servidor son una alternativa cuando la revocación debe ser inmediata y global.", "La revocación se maneja en el gateway (invalidación de sesión, logout). Los servicios downstream dependen de tokens de vida corta o re-validación periódica si se requiere \"logout en todos lados\" sin un almacén compartido de revocación."] },
    { title: "Estrategia de auditoría y logging", paragraphs: ["Registramos acciones que cambian estado con quién (id de actor o servicio), qué (tipo de acción, id de recurso), cuándo (timestamp) y contexto suficiente para reproducir (ej. clave de idempotencia, event_id, id de entidad creada/actualizada). Los logs son append-only e inmutables; sin edición in-place. Eso soporta compliance y análisis post-incidente.", "Campos estructurados (JSON o clave-valor) permiten consultar por correlation_id, request_id o user_id. Los correlation IDs se propagan entre fronteras de servicios para que un pago o login pueda trazarse desde el gateway hasta la escritura en DB. La retención es por política: corta para logs de debug ruidosos, más larga para auditoría y eventos de pago.", "Los datos sensibles no se registran en texto plano; registramos identificadores y tipos de evento, no PII completo ni datos de tarjeta. Los logs de auditoría se escriben de forma síncrona en el camino crítico para no perder eventos ante un crash; mantenemos el payload pequeño y la escritura rápida (ej. a una tabla o stream dedicado)."] },
    { title: "Observabilidad y detección de fallas", paragraphs: ["Los health checks se separan: liveness (proceso activo) vs readiness (dependencias aceptables). Un servicio que no puede alcanzar la DB o un proveedor de identidad debe fallar readiness para que el orquestador no envíe tráfico hasta que se recupere. Evitamos marcar healthy cuando no podemos cumplir requests.", "Instrumentamos flujos de pago e identidad con métricas: latencia (p50/p99), tasa de error por resultado (ej. éxito, duplicado idempotente, fallo de validación) y tasa de hit de idempotencia. Las alertas se disparan ante tasa de error elevada, fallos de dependencias (ej. API nacional caída) y fallos de procesamiento de webhooks. Los dashboards muestran éxito vs duplicado vs fallo para distinguir reintentos de regresiones reales.", "El tracing distribuido (trace_id entre servicios) une un request desde la API hasta la cola y la DB. Cuando un pago o login falla, podemos seguir el mismo trace_id en logs y traces. La detección de fallas no es solo \"servicio caído\" sino \"funcionando con semántica degradada\"—ej. alertamos cuando no podemos verificar identidad y estamos sirviendo sesiones no verificadas, para que la decisión de degradar sea explícita y visible."] },
  ],
  optimizeFor: [
    { title: "Corrección sobre comodidad", explanation: "Las transiciones de estado y los resultados de pago deben ser correctos bajo reintentos y fallas; atajos que relajan consistencia no son aceptables." },
    { title: "Límites de confianza claros", explanation: "Un componente es dueño de cada frontera crítica (quién emite tokens, quién escribe estado de pago); sin propiedad compartida o ambigua." },
    { title: "Propiedad explícita de transiciones de estado", explanation: "Un único escritor por estado; ni frontend ni redirect manejan \"pagado\" o \"verified\" sin verificación." },
    { title: "Observabilidad desde el día uno", explanation: "Logs, métricas y tracing en su lugar antes de escalar; modos de falla y comportamiento degradado visibles y alertables." },
    { title: "Simplicidad operativa sobre distribución prematura", explanation: "Monolito modular con fronteras claras preferido a microservicios hasta que escala y equipo justifiquen el costo operativo." },
  ] as OptimizeForItem[],
  ui: uiEs,
};

export default es;
