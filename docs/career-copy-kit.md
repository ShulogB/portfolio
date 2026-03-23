# Career Copy Kit (EN/ES)

Reusable copy for CV, LinkedIn and interview prep.

## CV bullets (EN)

- Hardened payment integrity by removing attacker-controlled trust signals and enforcing signature + amount validation across checkout and webhooks.
- Implemented server-side pricing reconciliation to prevent manipulated client amounts from reaching approved transaction states.
- Migrated transfer integrations from ambiguous free-text notes to a contract-first structured payload (`kind`, `trfDetail`) with conditional validation.
- Shifted API posture to secure-by-default with global authenticated permissions, scoped throttling, and safer error handling.
- Improved operational reliability through normalized input handling, structured internal logging, and explicit guardrails on sensitive routes.

## CV bullets (ES)

- Reforcé la integridad de pagos eliminando señales de confianza controladas por atacante y aplicando validación de firma + monto en checkout y webhooks.
- Implementé reconciliación server-side de precios para evitar aprobaciones con montos manipulados desde cliente.
- Migré integraciones de transfer desde notas de texto ambiguas a payload estructurado contract-first (`kind`, `trfDetail`) con validación condicional.
- Cambié la postura de API a secure-by-default con permisos globales autenticados, throttling por scope y manejo más seguro de errores.
- Mejoré la confiabilidad operativa con normalización temprana de inputs, logging interno estructurado y guardrails explícitos en rutas sensibles.

## LinkedIn About (EN, short)

Senior Backend Engineer focused on transactional correctness, payment integrity, and explicit trust boundaries.
I design production backends that stay reliable under retries, concurrency, and hostile inputs.
Recent work includes hardening webhook/payment flows against fraud vectors, moving integrations to contract-first payloads, and operating APIs with secure-by-default guardrails.

## LinkedIn About (ES, short)

Ingeniero Backend Senior enfocado en corrección transaccional, integridad de pagos y límites de confianza explícitos.
Diseño backends de producción que se mantienen confiables bajo reintentos, concurrencia e inputs hostiles.
Trabajo reciente: hardening de flujos webhook/pagos contra vectores de fraude, migración de integraciones a payloads contract-first y operación de APIs con guardrails secure-by-default.

## Interview quick lines (EN)

- "I remove attacker-controlled trust decisions from critical payment state transitions."
- "If a value affects money or identity, the server recomputes or verifies it before state changes."
- "I prefer secure defaults globally and explicit exceptions over endpoint-by-endpoint hardening."

## Interview quick lines (ES)

- "Elimino decisiones de confianza controladas por atacante en transiciones críticas de pago."
- "Si un valor impacta dinero o identidad, el servidor lo recalcula o valida antes de cambiar estado."
- "Prefiero defaults seguros globales y excepciones explícitas antes que hardening endpoint por endpoint."
