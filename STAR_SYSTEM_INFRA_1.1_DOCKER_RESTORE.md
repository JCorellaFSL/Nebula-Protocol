# Star System Infra 1.1: Docker Restore

## 1. Technical Overview
Restore the PostgreSQL service to `docker-compose.yml` and update the API configuration to use the internal container networking instead of `host.docker.internal`.

## 2. Implementation Steps

### Step 1: Restore PostgreSQL Service
- **Action:** Add the `postgres` service block back to `docker-compose.yml`.
- **Configuration:**
    - Image: `postgres:15-alpine`
    - Container Name: `nebula-postgres`
    - Environment: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` matching API config.
    - Volumes: `postgres-data:/var/lib/postgresql/data`
    - Networks: `nebula-network`

### Step 2: Update API Configuration
- **Action:** Update `nebula-api` environment variables in `docker-compose.yml`.
- **Changes:**
    - `POSTGRES_HOST`: Change from `host.docker.internal` to `postgres` (or `nebula-postgres`).
    - `POSTGRES_PORT`: Change from `5433` (external) to `5432` (standard internal).
    - Remove `extra_hosts` section if no longer needed.

### Step 3: Restore Volumes
- **Action:** Ensure `postgres-data` is defined in the `volumes` section.

## 3. Technical Specifications
- **Postgres Version:** 15-alpine (standard stable).
- **Internal Port:** 5432.

## 4. Testing & Validation
- **Command:** `docker-compose config`
- **Check:** Verify service links and volume definitions.

