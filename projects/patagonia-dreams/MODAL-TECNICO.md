# Modal técnico — Proyecto backend productivo

Estructura orientada a reclutadores técnicos. Contenido profesional, claro y centrado en ingeniería.

---

## 1. Contexto del negocio

- **Sector**: *(ej. turismo, reservas, marketplace)*
- **Problema que resuelve**: *(ej. centralizar reservas, pagos y operación de múltiples proveedores)*
- **Usuarios clave**: *(partners/proveedores, clientes finales, equipo interno)*
- **Métricas de impacto**: *(volumen de reservas, transacciones, usuarios activos — si aplica)*

*Objetivo: que el reclutador entienda el dominio y la escala en una lectura rápida.*

---

## 2. Arquitectura general del sistema

- **Diagrama o descripción de capas**:
  - Cliente / Frontend
  - API / Backend (servicios, capa de dominio)
  - Integraciones externas (pagos, reviews, proveedores)
  - Infraestructura (AWS, Docker, CI/CD)
- **Patrones**: *(ej. monolito modular, microservicios, eventos, colas)*
- **Despliegue**: *(contenedores, pipelines, ambientes)*

*Objetivo: mostrar visión de sistema y decisiones de alto nivel.*

---

## 3. Diseño de modelos y permisos

- **Entidades principales**: *(usuarios, roles, reservas, actividades, promociones, transacciones)*
- **Modelo de roles**: *(ej. admin, partner, cliente; atributos por rol)*
- **Permisos y autorización**: *(RBAC, políticas por recurso, integración con Cognito u otro IdP)*
- **Multi-tenancy**: *(cómo se aísla datos entre partners o organizaciones)*

*Objetivo: demostrar capacidad de diseño de dominio y seguridad de acceso.*

---

## 4. Flujo de reservas

- **Estados del ciclo de vida**: *(ej. cotización → reserva → confirmada → cancelada / completada)*
- **Participantes**: *(cliente, partner, sistema, integraciones)*
- **Reglas de negocio**: *(disponibilidad, plazos, cancelación, modificaciones)*
- **Idempotencia y consistencia**: *(cómo se evitan dobles reservas, uso de transacciones o eventos)*

*Objetivo: explicar el flujo core del producto de forma clara y técnica.*

---

## 5. Flujo de pagos con validación de webhooks

- **Gateways**: *(Mercado Pago, Stripe, Pix — flujos soportados)*
- **Flujo estándar**: *(creación de intención de pago → redirección/checkout → webhook de confirmación)*
- **Validación de webhooks**:
  - Verificación de firma (HMAC, headers, secretos)
  - Idempotencia por `id` o idempotency key
  - Reconcilación con reservas (estado de pago ↔ estado de reserva)
- **Manejo de fallos**: *(reintentos, dead letter, alertas, reversas)*

*Objetivo: transmitir experiencia real en pagos y seguridad en integraciones.*

---

## 6. Motor de promociones dinámicas

- **Tipos de promoción**: *(cupones, ofertas por producto/categoría, flash deals)*
- **Reglas y prioridad**: *(cómo se aplican, orden de evaluación, conflictos)*
- **Efecto en precios y reservas**: *(descuentos, códigos, restricciones por fecha o inventario)*
- **Persistencia y auditoría**: *(historial de uso, reportes, trazabilidad)*

*Objetivo: mostrar lógica de negocio compleja y diseño extensible.*

---

## 7. Normalización y sincronización de datos

- **Fuentes de datos**: *(catálogo interno, proveedores externos, APIs de actividades)*
- **Modelo unificado**: *(entidades normalizadas, mapeo de IDs y atributos)*
- **Sincronización**: *(batch, eventos, webhooks; frecuencia y consistencia eventual)*
- **Conflictos y calidad**: *(resolución de duplicados, validación, limpieza)*

*Objetivo: evidenciar trabajo con datos distribuidos y integración entre sistemas.*

---

## 8. Automatización de respuestas a reviews

- **Integración**: *(API de Google Reviews o similar)*
- **Trigger**: *(nuevo review, umbral de rating, tipo de comentario)*
- **Lógica de respuesta**: *(plantillas, reglas, personalización, aprobación opcional)*
- **Límites y cumplimiento**: *(rate limits, políticas de la plataforma, auditoría)*

*Objetivo: mostrar capacidad de integración y automatización operativa.*

---

## 9. Problemas técnicos enfrentados

- **Problema 1**: *(descripción breve)*  
  - Causa / contexto  
  - Enfoque de solución  
  - Resultado
- **Problema 2**: *(ej. idempotencia en webhooks, consistencia reserva–pago)*  
  - Causa / contexto  
  - Enfoque de solución  
  - Resultado
- **Problema 3**: *(ej. rendimiento, escalabilidad, deuda técnica)*  
  - Causa / contexto  
  - Enfoque de solución  
  - Resultado

*Objetivo: demostrar pensamiento crítico, debugging y capacidad de resolver en producción.*

---

## 10. Decisiones de arquitectura tomadas

| Decisión | Alternativas consideradas | Justificación |
|----------|---------------------------|---------------|
| *(ej. Monolito modular vs microservicios)* | *(opciones)* | *(trade-offs, equipo, plazos)* |
| *(ej. Webhooks síncronos vs cola de eventos)* | *(opciones)* | *(consistencia, resiliencia, operación)* |
| *(ej. Cognito para auth)* | *(auth propio, otro IdP)* | *(seguridad, mantenimiento, compliance)* |

*Objetivo: mostrar que piensas en trade-offs y documentas el “por qué”.*

---

## Uso en UI

- Este contenido puede mostrarse dentro de un **modal** al hacer clic en “Ver detalle técnico” en la tarjeta del proyecto.
- Mantener **títulos numerados** y **párrafos cortos** para escaneo rápido.
- Opcional: incluir un **diagrama** (ASCII o imagen) en la sección de arquitectura.
- Versión **resumida** (3–4 líneas por sección) para el modal; enlace a este documento completo para “Leer más”.

---

*Documento base para modal técnico orientado a reclutadores. Completar con datos reales del proyecto.*
