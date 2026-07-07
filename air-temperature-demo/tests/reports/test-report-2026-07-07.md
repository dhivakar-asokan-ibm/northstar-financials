# Test Report — Singapore Air Temperature API

**Date:** 2026-07-07T15:03:16Z
**Project:** `air-temperature-demo`
**Test file:** `air-temperature-demo:air-temperature-api-test:1.0`
**Backend endpoint:** `https://sample-api.eu-west-a.apiconnect.automation.ibm.com/environment`

---

## Summary

| Total Passed | Total Failed | Status   |
|:------------:|:------------:|:--------:|
| 15           | 0            | ✅ Passed |

---

## Test Cases

### TC-1 — GET /air-temperature (no parameters)
**Purpose:** Happy path — fetch all current air temperature readings

| Assertion                              | Status |
|----------------------------------------|--------|
| Validate response status code (200)    | ✅ Passed |
| Validate content type is JSON          | ✅ Passed |
| Validate response body has `items`     | ✅ Passed |
| Validate response body has `api_info`  | ✅ Passed |
| Validate `api_info` has `status`       | ✅ Passed |

---

### TC-2 — GET /air-temperature?station_id=S101
**Purpose:** Filter readings by a specific station identifier

| Assertion                              | Status |
|----------------------------------------|--------|
| Validate response status code (200)    | ✅ Passed |
| Validate content type is JSON          | ✅ Passed |
| Validate response body has `items`     | ✅ Passed |
| Validate response body has `api_info`  | ✅ Passed |
| Validate `api_info` has `status`       | ✅ Passed |

---

### TC-3 — GET /air-temperature?start_time=...&end_time=...
**Purpose:** Filter readings by ISO-8601 time range

| Assertion                              | Status |
|----------------------------------------|--------|
| Validate response status code (200)    | ✅ Passed |
| Validate content type is JSON          | ✅ Passed |
| Validate response body has `items`     | ✅ Passed |
| Validate response body has `api_info`  | ✅ Passed |
| Validate `api_info` has `status`       | ✅ Passed |

---

### TC-4 — GET /air-temperature (no credentials)
**Purpose:** Verify 401 when auth headers are absent  
**Status:** ⏭ Skipped — backend has no gateway auth layer; applicable after subscribing via APIC catalog

---

## Assertion Files

| File | Covers |
|------|--------|
| `200-air-temperature-response.yaml` | Status 200, content-type, `items`, `api_info.status` |
| `400-bad-request.yaml` | Status 400 (ready for future use) |
| `401-unauthorized.yaml` | Status 401 (active once gateway auth is enforced) |

## Environment File

`air-temperature-test-environment.yaml` — variables `client_id` and `client_secret` (secrets, supplied at runtime via `--env`)
