# API Connect Repository — Agent Standards & Conventions

This file defines the **mandatory rules and conventions** that all AI coding agents MUST follow when creating, modifying, or managing IBM API Connect assets and projects in this repository. These rules reflect the production standards of **Northstar Financial Group**, a fictional enterprise with three API Connect organisations.

> ⚠️ **All agents must read and apply every rule in this file before creating or modifying any asset or project.**

---

## Organisations Overview

| Organisation | Short Code | Purpose |
|---|---|---|
| **CRM** | `crm` | Customer Relationship Management — customer profiles, interactions, segmentation |
| **E-Commerce** | `ecom` | Online storefront — product catalogue, cart, orders, payments |
| **Finance** | `fin` | Financial operations — accounts, transactions, billing, regulatory reporting |

---

## 1. Project Naming Conventions

Every project name MUST start with the organisation prefix.

| Organisation | Prefix | Example project names |
|---|---|---|
| CRM | `crm_` | `crm_customer_profile`, `crm_lead_management`, `crm_interaction_history` |
| E-Commerce | `ecom_` | `ecom_product_catalog`, `ecom_cart_service`, `ecom_order_management` |
| Finance | `fin_` | `fin_accounts_api`, `fin_transaction_history`, `fin_billing_service` |

**Rules:**
- Use **snake_case** only — no hyphens, spaces, or camelCase in project names.
- Project names must be **lowercase**.
- After the prefix, the name must describe the business domain (e.g., `crm_loyalty_points`, not `crm_api1`).
- Maximum project name length: **48 characters** (including the prefix).

---

## 2. API Naming Conventions

API asset names follow the pattern: `<org-prefix>-<domain>-api`

| Organisation | Pattern | Examples |
|---|---|---|
| CRM | `crm-<domain>-api` | `crm-customer-api`, `crm-segment-api` |
| E-Commerce | `ecom-<domain>-api` | `ecom-product-api`, `ecom-checkout-api` |
| Finance | `fin-<domain>-api` | `fin-accounts-api`, `fin-payments-api` |

**Rules:**
- Use **kebab-case** (hyphen-separated lowercase) for API names.
- All supporting assets (policies, sequences, URISchemes) must be prefixed consistently to match the API name. For example, for `crm-customer-api`:
  - PolicySequence → `crm-customer-policy-sequence`
  - Invoke policy → `crm-customer-invoke`
  - URISchemes → `crm-customer-uri-schemes`
- API `metadata.name` must match the filename (without `.yaml`).

---

## 3. Versioning Standards

- All assets MUST use **semantic versioning** starting at `1.0`.
- Version must always be a **quoted string** in YAML: `version: '1.0'`, never bare `version: 1.0`.
- The API asset `metadata.version` MUST match the OpenAPI spec `info.version` exactly.

---

## 4. Namespace Rules

- Every asset's `metadata.namespace` must equal the **project name** it belongs to.
- Never use a generic namespace like `default`, `api`, or `test`.
- Example: all assets in project `crm_customer_profile` must have `namespace: crm_customer_profile`.

---

## 5. Mandatory Metadata Tags

Every asset MUST include `metadata.tags` with **1 to 3 tags** drawn from the approved tag vocabulary below.

Do **not** use gateway names, asset kinds, or environment names as tags.

### Approved Tag Vocabulary

**CRM org tags:**
`crm`, `customer`, `profile`, `segment`, `loyalty`, `interaction`, `lead`, `contact`, `marketing`

**E-Commerce org tags:**
`ecom`, `product`, `catalogue`, `cart`, `order`, `payment`, `checkout`, `inventory`, `shipping`, `returns`

**Finance org tags:**
`fin`, `accounts`, `transaction`, `billing`, `reporting`, `regulatory`, `ledger`, `payments`, `audit`

**Cross-org tags (usable by any org):**
`internal`, `external`, `partner`, `b2b`, `b2c`, `pii`, `sensitive`, `high-traffic`, `read-only`

**Example:**
```yaml
metadata:
  name: crm-customer-api
  namespace: crm_customer_profile
  version: '1.0'
  tags:
    - crm
    - customer
    - pii
```

---

## 6. Gateway Selection

| Org | Default Gateway | Notes |
|---|---|---|
| CRM | `lwgw` (DataPower Nano) | All CRM APIs use lwgw unless explicitly approved otherwise |
| E-Commerce | `lwgw` (DataPower Nano) | High-traffic public-facing APIs — lwgw preferred |
| Finance | `wmgw` (webMethods) | Regulatory and compliance requirements mandate wmgw for Finance |

> ⚠️ **Finance org MUST always use `wmgw`**. Never generate `FreeFlowPolicySequence` or lwgw-specific policies for Finance projects.

> ⚠️ **CRM and E-Commerce MUST always use `lwgw`**. Never generate `StagedPolicySequence` or IAM policies for these orgs unless the user explicitly requests a gateway override.

---

## 7. Security Requirements by Organisation

### CRM Organisation
- All APIs exposing customer PII data MUST include a JWT security pipeline:
  `ExtractIdentity (jwt)` → `Authenticate (jwt)` → `Authorize (jwt)`
- APIs used only for internal service-to-service calls MAY use API Key authentication:
  `ExtractIdentity (apiKey)` → `Authenticate (subscription)`
- **Never** deploy a CRM API without security.

### E-Commerce Organisation
- Public product catalogue APIs (read-only) may use API Key authentication.
- All cart, order, and payment APIs MUST use JWT authentication.
- Rate limiting (`RateLimit` policy) is **mandatory** on all public-facing E-Commerce APIs.

### Finance Organisation
- All Finance APIs MUST use `IAM` policy (wmgw) with JWT.
- All Finance API responses containing account or transaction data MUST include the `DataMasking` policy.
- **No Finance API may be deployed without security.** This is a hard regulatory requirement.

---

## 8. Required Policies by Organisation

### CRM — Required in every PolicySequence

| Stage | Required Policies |
|---|---|
| `main` | `ExtractIdentity`, `Authenticate`, `Authorize`, `Invoke` |
| `monitoring` | `Telemetry` (mandatory for all CRM APIs for GDPR audit trails) |
| `error` | At minimum one error-handling policy (`Throw` or `Try`) |

### E-Commerce — Required in every PolicySequence

| Stage | Required Policies |
|---|---|
| `main` | `RateLimit` (first), security policies, `Invoke` |
| `monitoring` | `Telemetry` |
| `error` | At minimum one error-handling policy |

### Finance — Required in every StagedPolicySequence (wmgw)

| Stage | Required Policies |
|---|---|
| `security` | `IAM` |
| `routing` | `Invoke` |
| `postRouting` | `DataMasking` (for any API returning account/transaction data) |
| `monitoring` | `MonitorTraffic` (mandatory for all Finance APIs for regulatory logging) |
| `error` | `ErrorProcessing` |

---

## 9. Backend Endpoint URL Conventions

Backend endpoint URLs MUST follow these environment-specific base URL patterns:

**Rules:**
- Always ask the user which environment the API is targeting if not specified.
- Never use `localhost` or bare IP addresses in any asset committed to this repository.
- Backend paths append to the base URL: `https://crm-dev.internal.northstar.com/v1/customers`

---

## 10. Product and Plan Standards

Every API MUST be associated with a Product before it can be published. Products and Plans must follow these naming conventions:

| Asset | Naming Pattern | Example |
|---|---|---|
| Product | `<org-prefix>-<domain>-product` | `crm-customer-product`, `ecom-order-product` |
| Plan | `<org-prefix>-<tier>-plan` | `crm-standard-plan`, `ecom-premium-plan`, `fin-enterprise-plan` |
| Quota | `<org-prefix>-<tier>-quota` | `crm-standard-quota`, `fin-enterprise-quota` |

---

## 11. File Structure

All projects in this repository follow this mandatory directory layout:

```
<project-name>/
├── apis/
│   └── <api-name>.yaml
├── spec/
│   └── <api-name>-openapi.yaml
├── policies/
│   ├── <api-name>-sequence.yaml
│   ├── <api-name>-invoke.yaml
│   └── <api-name>-uri-schemes.yaml
├── security/
│   └── <api-name>-<security-type>.yaml
├── products/
│   └── <product-name>.yaml
├── plans/
│   └── <plan-name>.yaml
└── quotas/
    └── <quota-name>.yaml
```

> ⚠️ Never place assets outside their designated subdirectory. Never commit raw OpenAPI specs without a corresponding API asset.

---

## 12. Prohibited Practices

The following are hard prohibitions across all orgs:

1. **No generic names** — asset names like `my-api`, `test-api`, `api1`, `new-api` are rejected by the pipeline validator.
2. **No missing security on external APIs** — any API with `external` or `b2b` or `b2c` tags MUST have security policies.
3. **No cross-org namespace pollution** — a `crm_*` project must never contain assets tagged with `fin` or `ecom` tags.
4. **No hardcoded credentials** — never embed API keys, tokens, passwords, or secrets in any YAML asset.
5. **No unversioned assets** — every asset MUST have `metadata.version` set.
6. **No bare numeric versions** — always quote versions: `'1.0'` not `1.0`.
7. **No Finance APIs on lwgw** — Finance org is exclusively wmgw.
8. **No CRM or E-Commerce APIs on wmgw** — these orgs are exclusively lwgw.

---

## 13. Agent Checklist — Before Creating Any Asset

Before generating any asset or project, the agent MUST verify:

- [ ] **Determine the org** — Which org does this work belong to? (CRM, E-Commerce, or Finance)
- [ ] **Apply project prefix** — Does the project name start with the correct org prefix? (`crm_`, `ecom_`, `fin_`)
- [ ] **Apply API naming** — Does the API name follow `<org-prefix>-<domain>-api` in kebab-case?
- [ ] **Select the correct gateway** — CRM/E-Commerce → `lwgw`; Finance → `wmgw`
- [ ] **Namespace matches project name** — `metadata.namespace` equals the project name
- [ ] **Tags are from approved vocabulary** — no gateway names, env names, or kind names as tags
- [ ] **Security is planned** — which security pipeline applies for this org and API type?
- [ ] **Org-required policies are included** — Telemetry/MonitorTraffic, RateLimit (E-Commerce), DataMasking (Finance)
- [ ] **Backend URL follows env convention** — correct base URL for the target environment
- [ ] **Version is a quoted string** — `'1.0'` not `1.0`
- [ ] **File placed in correct subdirectory** — `apis/`, `policies/`, `security/`, `products/`, `plans/`, `quotas/`

---

## 14. Example: Creating a New CRM API

```
Project: crm_customer_profile
API name: crm-customer-api
Gateway: lwgw
Namespace: crm_customer_profile
Tags: [crm, customer, pii]
Security: ExtractIdentity (jwt) → Authenticate (jwt) → Authorize (jwt)
Monitoring: Telemetry (mandatory)
Backend URL: <prompt-from-user>
Product: crm-customer-product
Plan: crm-standard-plan
```

## 15. Example: Creating a New Finance API

```
Project: fin_accounts_api
API name: fin-accounts-api
Gateway: wmgw
Namespace: fin_accounts_api
Tags: [fin, accounts, sensitive]
Security: IAM (JWT)
Post-routing: DataMasking
Monitoring: MonitorTraffic (mandatory)
Backend URL: <prompt-from-user>
Product: fin-accounts-product
Plan: fin-enterprise-plan
```

---

*This file is the authoritative source of standards for this repository. All agents must comply with these rules unconditionally.*
