# Constellation Infra 1: Local Restoration & Migration
**Pivot:** Restoring full local Docker functionality from Hivelocity deployment.

## 1. Constellation Overview
This constellation focuses on migrating the Nebula Protocol infrastructure from a Hivelocity-targeted "Bare Metal + Docker" hybrid approach back to a fully self-contained "Docker Desktop" environment. This involves restoring the PostgreSQL container within the Docker Compose stack and removing dependencies on external host services.

## 2. Goals & Success Criteria
- **Goal:** Restore `postgres` service to `docker-compose.yml`.
- **Goal:** Configure `nebula-api` to talk to the internal dockerized Postgres.
- **Goal:** Ensure the stack (API, Redis, Postgres, Nginx) comes up cleanly in Docker Desktop.
- **Success Criteria:**
    - `docker-compose.yml` is valid and self-contained.
    - No dependencies on `host.docker.internal` for core database functions.
    - Documentation reflects the local Docker approach.

## 3. Scope & Boundaries
- **In Scope:** `docker-compose.yml`, `.env` configuration, `nginx` config review.
- **Out of Scope:** Feature development, P.A.N.I.C. IDE changes (this is purely protocol infra).

## 4. Star System Breakdown
- **`STAR_SYSTEM_INFRA_1.1_DOCKER_RESTORE.md`**: Re-integrate PostgreSQL and update networking.
- **`STAR_SYSTEM_INFRA_1.2_CONFIG_CLEANUP.md`**: Audit and clean Hivelocity references.

## 5. Star Gate Requirements
- **Tests:** `docker-compose config` passes.
- **Manual Check:** Review `docker-compose.yml` for external host references.

