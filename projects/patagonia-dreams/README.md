# Patagonia Dreams

**Production booking platform for tourism — backoffice, payments, multi-tenant operations.**

Real-world system handling reservations, partners, promotions, and payments in production. Built with a focus on transactional integrity, security, and operational scalability.

---

## Overview

Patagonia Dreams is a **tourism reservation platform** with a complex backoffice, multi-role user management (partners and end customers), promotions (coupons, special offers, flash deals), and integrated payment flows. The system normalizes and maps activities across internal and external systems, processes webhooks from payment providers with signature validation, and ensures idempotent, secure transactions.

---

## Tech Stack

| Area | Technologies |
|------|--------------|
| **Backend** | *(Specify: e.g. Node/Express, Python/Django, .NET, etc.)* |
| **Auth & identity** | AWS Cognito |
| **Payments** | Mercado Pago, Stripe, Pix |
| **Integrations** | Google Reviews (automated responses) |
| **Infrastructure** | Docker, AWS |
| **CI/CD** | GitHub Actions |

*Replace the backend row with your actual stack (language/framework).*

---

## Technical Highlights

### Backoffice & domain

- **Multi-module backoffice**: Admin and operational modules for reservations, users, promotions, and reporting.
- **Role-based access**: Different flows and permissions for partners vs end customers.
- **Promotions engine**: Coupons, special offers, and flash deals with clear business rules and reporting.
- **Reservation lifecycle**: Full flow from quote to confirmation, with reporting and audit trail.
- **Data normalization**: Mapping and normalization of activities across systems (internal catalog vs external providers).

### Payments & transactions

- **Multiple gateways**: Integration with Mercado Pago, Stripe, and Pix.
- **Webhooks**: Incoming payment events with **signature validation** to ensure authenticity and avoid replay/forgery.
- **Transactional safety**: Design for **idempotency** on payment and booking operations to prevent double charges and duplicate reservations.
- **Secure handling**: No sensitive payment data stored beyond what’s required; reliance on provider tokens and webhooks.

### Integrations & automation

- **Google Reviews**: Integration with Google Reviews API and **automated reply** logic for new reviews (templates, rules, audit).

### Infrastructure & DevOps

- **Containerization**: Docker for local and deployed environments.
- **CI/CD**: Pipelines with GitHub Actions (build, test, deploy).
- **Cloud**: AWS (e.g. Cognito for auth; specify other services if relevant: RDS, Lambda, ECS, etc.).

---

## Why this demonstrates seniority

| Concern | How it shows in this project |
|--------|------------------------------|
| **Production systems** | Real platform in use: reservations, payments, and backoffice operations. |
| **Transactional integrity** | Idempotency, webhook verification, and clear handling of payment and booking state. |
| **Security** | Signature validation on webhooks, separation of roles, secure payment integration patterns. |
| **Operational complexity** | Multi-tenant (partners + customers), promotions, reporting, and cross-system data mapping. |
| **DevOps & delivery** | Docker, CI/CD with GitHub Actions, and AWS usage (Cognito and beyond). |

---

## Suggested wording for your CV / LinkedIn

**Backend developer — Patagonia Dreams** *(dates)*  
Tourism reservation platform in production. Designed and maintained backend for bookings, backoffice (multi-module), and payment flows (Mercado Pago, Stripe, Pix) with webhook signature validation and idempotent transactions. Implemented promotion engine (coupons, flash deals), role-based access (partners vs customers), and Google Reviews integration with automated responses. Stack: Docker, GitHub Actions CI/CD, AWS (Cognito). Focus on transactional reliability and security in payment and reservation flows.

---

*Use this README as the single source of truth for how you present Patagonia Dreams to technical recruiters and hiring managers. Fill in the exact backend stack and any extra AWS services where indicated.*
