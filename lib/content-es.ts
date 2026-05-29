/**
 * Contenido en español. Cargado bajo demanda en el cliente (dynamic import)
 * cuando el usuario elige idioma ES, para reducir el bundle inicial.
 */
import type { AdrLink, ExperienceSummaryItem, OptimizeForItem, ProductionDecision, TradeoffItem, UILabels } from "./content-types";

const uiEs = {
  hero: {
    tagline: "Ingeniero backend — sistemas en producción",
    caseStudies: "Estudios de caso",
    viewProjects: "Ver proyectos",
    github: "GitHub",
    linkedin: "LinkedIn",
    downloadResume: "Descargar CV (PDF)",
  },
  problemsSolved: {
    context: "Contexto",
    whatYouDid: "Qué hice",
    impact: "Impacto",
  },
  sections: {
    home: "Inicio",
    executiveSnapshot: "Resumen ejecutivo",
    experienceSummary: "Impacto y experiencia",
    caseStudies: "Estudios de caso",
    productionProjects: "Proyectos en producción",
    problemsSolved: "Problemas que aparecieron y cómo los resolvimos",
    principles: "Principios de ingeniería",
    howBuild: "Cómo construyo backends de producción",
    architectureDeepDive: "Arquitectura y diseño",
    explicitTradeoffs: "Tradeoffs explícitos",
    decisions: "Decisiones de ingeniería",
    stack: "Tecnologías",
    optimizeFor: "Qué optimizo",
    contact: "Contacto",
  },
  contact: {
    name: "Nombre",
    email: "Email",
    message: "Mensaje",
    send: "Enviar",
    successMessage: "Mensaje enviado. Te responderé pronto.",
    errorMessage: "No se pudo enviar. Reintentá o escribime por email.",
  },
  caseStudy: {
    label: "Estudio de caso",
    productionProjectLabel: "Proyecto en producción",
    scaleConstraints: "Escala y restricciones",
    rejected: "Qué se rechazó explícitamente",
    whatWouldBreak: "Qué rompería este sistema?",
    architectureDecisionRecords: "Architecture Decision Records",
    architectureAndDecisions: "Arquitectura y decisiones",
    viewDetails: "Leer el detalle técnico",
    scaleConstraintsRows: {
      requestVolume: "Volumen de requests",
      concurrency: "Concurrencia",
      externalDependencies: "Dependencias externas",
      failureModes: "Modos de fallo",
      dataConsistency: "Consistencia de datos",
    },
    gainedLabel: "Ganado:",
    sacrificedLabel: "Sacrificado:",
  },
  footer: "Sistemas backend para producción.",
  adminLogin: "Admin",
  project: { overview: "Resumen", viewLiveSite: "Ver sitio", deepDive: "Profundización", images: "Imágenes" },
} as UILabels;

const es = {
  hero: {
    name: "Giuliano Bentevenga",
    subtitle:
      "Backend Lead con +4 años en producción. Construí sistemas de identidad municipal y plataformas de reservas transaccionales desde cero, con foco en escalabilidad, seguridad y contratos que aguantan en producción real.",
    location: "Argentina — abierto a remoto",
    sidebarRole: "Ingeniero Backend · Sistemas que aguantan bajo presión",
    impactLine:
      "Especializado en pagos (Mercado Pago, Stripe, Pix), identidad (ARCA, ANSES, RENAPER, Mi Argentina) e integraciones con terceros (Google, Meta, Amazon SES). Diseño sistemas que se mantienen correctos bajo concurrencia y escalan junto con el negocio.",
  },
  productionProjectsIntro:
    "Dos sistemas que construí y lidero en producción. Abrí un proyecto para ver el desglose técnico completo: ADRs, restricciones de escala y modos de falla.",
  problemResolutions: [
    {
      projectTitle: "Patagonia Dreams — plataforma de reservas",
      items: [
        {
          context:
            "Dos requests concurrentes para el mismo slot leían ‘disponible’ antes de que ninguno hiciera commit — una clásica carrera de read-modify-write que generaba doble reserva en actividades de alta demanda.",
          whatYouDid:
            "Agregué SELECT FOR UPDATE sobre la fila de disponibilidad dentro de la misma transacción que crea la reserva. El segundo request queda bloqueado hasta que el primero hace commit o rollback, luego ve el estado actualizado y falla o tiene éxito de forma limpia.",
          impact:
            "Doble reserva eliminada en la frontera de la DB. Sin locks a nivel aplicación, sin lógica de reintento — la base de datos es el punto de serialización y el comportamiento es determinista.",
        },
        {
          context:
            "El flujo de pagos dependía del redirect del proveedor para marcar una reserva como ‘pagada’. Con tráfico real, cierres de pestaña, reintentos del proveedor y caídas de red hacían que el callback llegara tarde, dos veces o nunca.",
          whatYouDid:
            "Moví el estado ‘reserva pagada’ para que solo lo fijara el handler del webhook — nunca el redirect. Validación HMAC en cada payload entrante; procesamiento idempotente por event_id dentro de una única transacción de DB.",
          impact:
            "El estado de pago quedó consistente sin importar el comportamiento del cliente. Los webhooks duplicados son no-ops seguros. El redirect ahora es solo UI; nunca maneja estado.",
        },
        {
          context:
            "Los clientes de app confidenciales de Cognito exigen el parámetro SECRET_HASH en varias llamadas de auth (sign_up, confirm_sign_up, authenticate, refresh_token). Omitirlo en cualquier llamada devuelve un error críptico que la documentación de AWS no hace obvio.",
          whatYouDid:
            "Audité todos los call sites del SDK de Cognito, agregué SECRET_HASH derivado de HMAC-SHA256(username + client_id, client_secret) de forma consistente y centralicé el cálculo para que futuras llamadas no puedan omitirlo.",
          impact:
            "Flujos de auth estables en producción sin errores de SECRET_HASH. Los nuevos desarrolladores no pueden omitirlo accidentalmente — el helper lo impone.",
        },
        {
          context:
            "El negocio pedía identificadores con contexto por actividad: un mapeo global hacía que una modalidad ‘contagiara’ otras actividades.",
          whatYouDid:
            "Pasamos a mapeo con scope, subimos unicidad crítica a la base con constraints condicionales mientras convivía data legacy, migración aditiva y orden explícito de fallback.",
          impact:
            "Menos cruces raros entre actividades y una defensa seria ante concurrencia: el serializer no alcanza si la DB no cierra la regla.",
        },
        {
          context:
            "El backoffice exportaba en CSV. Datos de reservas ingresados por usuarios contenían strings que empezaban con =, + o - que Excel ejecutaba automáticamente como fórmulas — un vector de inyección clásico con datos comerciales reales en riesgo.",
          whatYouDid:
            "Reemplacé el endpoint CSV por una respuesta JSON. Eliminé el problema de sanitización por completo sacando el formato, no parcheándolo.",
          impact:
            "Vector de inyección eliminado. El equipo de operaciones recibe datos estructurados con fidelidad completa; sin riesgo de ejecución de fórmulas sin importar el contenido ingresado.",
        },
        {
          context:
            "Algunos pagos con tarjeta en Mercado Pago fallaban en la validación del payer sin error explícito de nuestro lado. El cliente veía el checkout caído; nosotros no veíamos nada roto en los logs.",
          whatYouDid:
            "MP espera {area_code: '11', number: '12345678'}, pero los usuarios cargan el teléfono en decenas de formatos distintos (+5491112345678, con/sin el 9 móvil, sin prefijo internacional, etc.). Escribí un normalizador que stripea todo lo que no es dígito, quita el código de país 54, quita el 9 móvil si aplica, y parte en area_code + number. Si el resultado tiene menos de 8 dígitos totales, manda null y omite el campo en lugar de mandar basura.",
          impact:
            "Modo de falla silencioso cerrado. El campo phone ahora solo viaja cuando es válido; MP deja de rechazar el payer por formato. El fix requirió leer los edge cases no documentados de la spec de payer de MP, no el happy path.",
        },
        {
          context:
            "Cuando un grupo de reservas se pagaba en cuotas o con dos medios de pago, el segundo webhook llegaba aprobado pero el sistema lo marcaba como 'pago parcial' y no liberaba la reserva. El equipo de operaciones tenía que intervenir manualmente cada vez.",
          whatYouDid:
            "El flujo original llamaba a GET /v1/payments/search dentro de transaction.atomic() para sumar todos los pagos aprobados con el mismo external_reference. La Search API de MP tiene eventual consistency — el payment_id que acaba de aprobarse puede no aparecer en los resultados por algunos segundos. Moví la llamada a Search antes del lock; agregué una guarda explícita: si payment_id no está en los resultados, sumo el monto verificado manualmente (el pago ya fue confirmado vía GET /payments/{id} que sí es consistente). También agregué un fast-path: si el pago actual cubre el total esperado solo, aprueba sin llamar a Search.",
          impact:
            "Falsos rechazos en split payments eliminados. El fast-path redujo llamadas a la Search API en el caso más común (pago único). El fix requirió leer la documentación de eventual consistency de MP que está fuera de la guía principal de webhooks.",
        },
        {
          context:
            "Flash deals y cupones con fecha de expiración pasada seguían apareciendo como disponibles en el checkout. El equipo los cargaba con fecha de vencimiento y esperaba que el sistema los desactivara solo — pero nada lo hacía.",
          whatYouDid:
            "Sin Celery, sin cron. La solución fue write-on-read: ejecutar check_and_update_expired_discounts() dentro del path de lectura — cada vez que se piden las listas de promociones o cupones, se corre un UPDATE sobre los registros expirados y se invalida el cache Redis si hubo cambios. La frecuencia de cambio es lo suficientemente baja como para que el costo de escritura extra sea aceptable sin infraestructura de workers.",
          impact:
            "Los descuentos expirados se desactivan automáticamente en minutos del próximo read. Sin intervención manual, sin cron externo, sin costo de infraestructura. El patrón intercambia un pequeño overhead de escritura por simplicidad operativa completa.",
        },
        {
          context:
            "Actividades con corte de reserva 'hasta las 18:00 del día anterior' empezaban a rechazar reservas desde las 15:00. Los guías reportaban que clientes no podían reservar en horarios que deberían estar habilitados. El bug solo aparecía en producción, no en local.",
          whatYouDid:
            "La validación comparaba timezone.localtime() contra el horario de corte. El servidor (Railway) corría en UTC y TIME_ZONE no estaba seteado a America/Argentina/Buenos_Aires, por lo que localtime() devolvía UTC — que es UTC-3 respecto de Argentina. El corte disparaba 3 horas antes. El fix fue setear TIME_ZONE = 'America/Argentina/Buenos_Aires' con USE_TZ = True, y que toda comparación de fecha/hora use timezone.localtime() explícitamente en lugar de datetime.now().",
          impact:
            "Ventana de reserva alineada con el horario real de Buenos Aires. Falsos rechazos en el rango 15:00–18:00 eliminados. Bug clásico de producción: local y Railway corrían en zonas horarias distintas y nada fallaba en voz alta.",
        },
        {
          context:
            "En conexiones lentas, el frontend reintentaba la llamada de creación de preferencia de pago si no recibía respuesta a tiempo. Esto generaba dos preferencias distintas en MP para la misma reserva — el cliente veía dos links de pago, y si pagaba ambos, teníamos un sobrepago.",
          whatYouDid:
            "Agregué x-idempotency-key al request de creación de preferencia: un SHA-256 sobre los campos determinísticos del payload (IDs de reserva, montos, external reference). MP garantiza que requests con el mismo idempotency key dentro de una ventana devuelven la preferencia existente sin crear una nueva. La clave se calcula con hashlib.sha256 sobre el payload relevante serializado.",
          impact:
            "Modo de falla de doble preferencia cerrado. Los reintentos del frontend son idempotentes por construcción. El fix no requirió cambios en el frontend — solo la key correcta del lado del servidor antes de llamar a MP.",
        },
        {
          context:
            "Después de introducir payment_group_id (UUID) para agrupar múltiples reservas bajo un pago, empezaron a llegar alertas de webhooks de MP que no encontraban ningún booking. Eran reservas antiguas creadas antes de que existiera el campo.",
          whatYouDid:
            "El webhook nuevo buscaba exclusivamente por payment_group_id. Agregué lógica de backward-compat: si no se encuentra booking por payment_group_id, fallback a booking_id (el path antiguo), y si se encuentra, se propaga payment_group_id al booking en ese momento para que futuros webhooks tomen el fast-path. El código loguea explícitamente 'booking antiguo sin payment_group_id' para visibilidad del período de transición.",
          impact:
            "Cero reservas huérfanas durante la migración. El campo se autorrellena en el primer webhook — sin script de migración masiva, sin downtime, sin backfill manual. El período de transición fue observable desde los logs.",
        },
      ],
    },
    {
      projectTitle: "Gateway de identidad municipal",
      items: [
        {
          context:
            "Varios servicios necesitaban una identidad de ciudadano sin que cada uno re-llame registros nacionales o duplique verificación.",
          whatYouDid:
            "Gateway central emite tokens; el resto valida y aplica RBAC. Claims mínimos, fail safe si caen las APIs nacionales, auditoría donde corresponde.",
          impact:
            "Una sola frontera de confianza y menos ‘cada equipo hace su auth’.",
        },
      ],
    },
    {
      projectTitle: "Orquestador de pagos (diseño)",
      items: [
        {
          context:
            "Inicios de pago y webhooks tienen que seguir correctos con reintentos, duplicados y writes concurrentes.",
          whatYouDid:
            "Idempotencia en altas de pago, patrón tipo outbox para llamadas a proveedor, webhooks idempotentes por id de evento, transacciones acotadas por transición de estado.",
          impact:
            "Los duplicados dejan de ser modo incendio: es la clase de historia que esperan escuchar en entrevistas senior.",
        },
      ],
    },
  ],
  principles: [
    { title: "Una única fuente de verdad para estado crítico", description: "Un componente es el único escritor del estado de pago e identidad. El frontend no puede mutar estado transaccional o verificado; los sistemas legacy no autentican. Elimina escritores competidores y confianza del lado cliente en el camino crítico." },
    { title: "Límites de confianza explícitos", description: "Definir quién valida, quién emite, quién consume. El gateway llama a las APIs de identidad y emite tokens; los servicios downstream validan tokens y aplican RBAC y no re-autentican. Límite aplicado en código y contratos." },
    { title: "Idempotencia para eventos reintentables y externos", description: "La creación de reservas y el procesamiento de webhooks son idempotentes por key o event_id. Reintentos y envíos duplicados pasan a ser operaciones seguras en lugar de modos de falla. Los sistemas externos reintentan; el diseño lo asume y no aplica dos veces." },
    { title: "Fail safe cuando la verificación es imposible", description: "Nunca emitir \"verified\" o \"paid\" cuando la verificación o confirmación no tuvo éxito. Si las APIs nacionales o los webhooks de pago no están disponibles, fail safe (modo degradado o error claro) en lugar de relajar la regla." },
    { title: "Actualizaciones atómicas para estado dependiente", description: "Cuando dos estados deben mantenerse sincronizados (ej. transacción de pago y reserva), actualizarlos en una única transacción de base de datos cuando sea posible. Commit de ambos o de ninguno para evitar \"pago exitoso, reserva aún pendiente\"." },
    { title: "Mínimos datos entre fronteras", description: "Tokens y payloads entre servicios llevan solo lo que el consumidor necesita para autorizar o cumplir el request. PII y datos crudos del registro se quedan en el lado que los posee. Limita el blast radius y preserva fronteras de compliance." },
  ],
  executiveSnapshot: [
    "Plataforma de reservas para una operadora con +180k pasajeros/año y +7.000 reseñas 5 estrellas en Google.",
    "~15k logins/mes en gateway de identidad municipal (autentica.bahia.gob.ar); 10+ servicios críticos centralizados, 2 años en producción ininterrumpida.",
    "p95 webhook-a-DB bajo 400 ms; 8+ servicios backend consumen tokens del gateway.",
    "Integraciones: Mercado Pago · Stripe · Pix · AWS (Cognito, SES, Secrets Manager) · Google (OAuth, My Business, Merchant Center) · Meta · ARCA · ANSES · RENAPER · Mi Argentina.",
  ],
  caseStudies: [
    {
      slug: "patagonia-dreams",
      title: "Plataforma transaccional de reservas y pagos",
      tech: "Django · PostgreSQL · pagos e integración con catálogo",
      preview:
        "Plataforma de reservas para una operadora con +180k pasajeros/año — construida desde cero y en producción. La restricción central: una reserva solo es 'pagada' cuando el webhook lo confirma, nunca por estado del cliente. Los webhooks son la única fuente de verdad, validados con HMAC y procesados idempotentemente por event_id. La disponibilidad se bloquea de forma pesimista (SELECT FOR UPDATE) para que reservas concurrentes en el mismo slot se serialicen en lugar de generar una carrera.",
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
      tech: "Gateway · tokens · validación con registros nacionales",
      preview:
        "SSO municipal para Bahía Blanca: los ciudadanos se autentican una vez y 10+ sistemas consumen tokens del gateway. Integra ARCA, ANSES, RENAPER y Mi Argentina. La verificación es explícita y fail-safe: no se emite token si las APIs nacionales no responden. ~15k logins/mes, 2 años en producción ininterrumpida.",
      diagramType: "identity" as const,
      adrs: [
        { title: "Gateway como único emisor de tokens; sistemas legacy solo validan", href: "#" },
        { title: "Sin PII en tokens; claims mínimos para autorización", href: "#" },
        { title: "Fail safe cuando las APIs nacionales de identidad no están disponibles", href: "#" },
        { title: "RBAC aplicado en gateway y en capa de servicio", href: "#" },
        { title: "Auditoría de autenticación y emisión de tokens", href: "#" },
      ] as AdrLink[],
    },
  ],
  experienceSummary: [
    { scope: "patagoniadreams.com.ar — disponibilidad de reservas", challenge: "reservas concurrentes para el mismo slot, carrera por marcar pagado", decision: "SELECT FOR UPDATE en la fila de disponibilidad; webhooks como único camino a \"reserva pagada\"", impact: "doble reserva eliminada; ~2k reservas/mes en producción." },
    { scope: "patagoniadreams.com.ar — webhooks de pago", challenge: "payloads duplicados o repetidos, reintentos del proveedor", decision: "Validación HMAC en todos los webhooks; idempotencia por event_id; único escritor del estado de pago", impact: "sin doble aplicación; reintentos seguros; p95 webhook-a-DB bajo 400 ms." },
    { scope: "patagoniadreams.com.ar — creación de reservas", challenge: "envíos duplicados (doble clic, reintentos del cliente)", decision: "Clave de idempotencia por request de creación; constraint único en la key en DB", impact: "reintentos seguros; sin reservas duplicadas." },
    { scope: "patagoniadreams.com.ar — estado de pago y reserva", challenge: "dos estados deben estar sincronizados; el frontend no puede manejar el estado", decision: "Una transacción DB en el webhook: crear/actualizar pago y marcar reserva pagada", impact: "no hay \"pagado\" sin webhook; sin estado partido." },
    { scope: "autentica.bahia.gob.ar — ciclo de vida del token de sesión", challenge: "quién emite, quién valida; evitar PII en tokens", decision: "Gateway único emisor; tokens con solo claims (sub, roles, exp); RBAC en gateway y en cada servicio", impact: "límite de confianza claro; ~15k logins/mes; 2 años en producción ininterrumpida." },
    { scope: "autentica.bahia.gob.ar — verificación de identidad", challenge: "APIs nacionales (RENAPER, ARCA) caídas o alta latencia", decision: "Nunca emitir \"verified\" cuando la verificación no tuvo éxito; modo degradado y alertas cuando las APIs no están", impact: "sin \"verified\" falso; re-validación en cada login." },
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
  stack: ["Python", "Django REST Framework", "PostgreSQL"],
  stackComplementary: ["AWS", "CI/CD", "GitHub Actions", "Docker"],
  stackIntegrations: ["Google OAuth", "Mercado Pago", "Stripe", "Pix", "Amazon SES", "Cognito", "Meta"],
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
