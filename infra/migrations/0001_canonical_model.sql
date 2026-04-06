-- Migration: 0001_canonical_model
-- Description: Initial schema for the canonical data model.
--              Defines core entities: legal_entities, jobs, workers,
--              pay_snapshots, pay_components, snapshot_manifests,
--              source_lineage_refs.
-- Applied to: PostgreSQL 15+
-- Idempotent: No — run exactly once per environment.

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE employment_type AS ENUM (
  'FULL_TIME',
  'PART_TIME',
  'CASUAL',
  'AGENCY'
);

CREATE TYPE contract_type AS ENUM (
  'PERMANENT',
  'FIXED_TERM',
  'TEMPORARY',
  'INTERNSHIP',
  'APPRENTICESHIP'
);

CREATE TYPE gender AS ENUM (
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'NOT_DISCLOSED'
);

CREATE TYPE worker_status AS ENUM (
  'ACTIVE',
  'ON_LEAVE',
  'TERMINATED'
);

CREATE TYPE snapshot_status AS ENUM (
  'DRAFT',
  'SEALED',
  'ARCHIVED'
);

CREATE TYPE pay_component_type AS ENUM (
  'BASE_SALARY',
  'VARIABLE_PAY',
  'BONUS',
  'COMMISSION',
  'OVERTIME',
  'ALLOWANCE',
  'BENEFIT_IN_KIND',
  'EMPLOYER_PENSION_CONTRIBUTION',
  'OTHER'
);

CREATE TYPE pay_period_code AS ENUM (
  'ANNUAL',
  'MONTHLY',
  'WEEKLY',
  'HOURLY',
  'ONE_OFF'
);

-- ============================================================
-- legal_entities
-- Organisational units that employ workers and hold reporting obligations.
-- ============================================================

CREATE TABLE legal_entities (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  code                     VARCHAR(64)  NOT NULL,
  name                     VARCHAR(256) NOT NULL,
  registered_country_code  CHAR(2)      NOT NULL,
  reporting_currency_code  VARCHAR(3)   NOT NULL,
  effective_from           DATE         NOT NULL,
  effective_to             DATE,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_legal_entity_code_period
    UNIQUE (code, effective_from),

  CONSTRAINT ck_legal_entity_effective_range
    CHECK (effective_to IS NULL OR effective_to > effective_from),

  CONSTRAINT ck_legal_entity_country_code
    CHECK (registered_country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX idx_legal_entities_code
  ON legal_entities (code);

CREATE INDEX idx_legal_entities_country
  ON legal_entities (registered_country_code);

-- ============================================================
-- jobs
-- Normalised job definitions within the internal job architecture.
-- Jobs are effective-dated to support historical snapshot traceability.
-- ============================================================

CREATE TABLE jobs (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(64)  NOT NULL,
  title          VARCHAR(256) NOT NULL,
  family_code    VARCHAR(64),
  function_code  VARCHAR(64),
  level_code     VARCHAR(32),
  is_active      BOOLEAN      NOT NULL DEFAULT true,
  effective_from DATE         NOT NULL,
  effective_to   DATE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_job_code_period
    UNIQUE (code, effective_from),

  CONSTRAINT ck_job_effective_range
    CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE INDEX idx_jobs_code
  ON jobs (code);

CREATE INDEX idx_jobs_is_active
  ON jobs (is_active);

-- ============================================================
-- workers
-- Canonical person records normalised from source systems.
-- Workers are effective-dated: changes create new rows rather than mutating.
-- ============================================================

CREATE TABLE workers (
  id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id         VARCHAR(128)     NOT NULL,
  legal_entity_id     UUID             NOT NULL REFERENCES legal_entities (id),
  job_id              UUID             NOT NULL REFERENCES jobs (id),
  employment_type     employment_type  NOT NULL,
  contract_type       contract_type    NOT NULL,
  gender              gender           NOT NULL,
  fte_fraction        NUMERIC(5, 4)    NOT NULL,
  hire_date           DATE             NOT NULL,
  termination_date    DATE,
  seniority_level_code VARCHAR(32),
  cost_center_code    VARCHAR(64),
  work_location_code  VARCHAR(64),
  status              worker_status    NOT NULL DEFAULT 'ACTIVE',
  effective_from      DATE             NOT NULL,
  effective_to        DATE,
  created_at          TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ      NOT NULL DEFAULT now(),

  CONSTRAINT ck_worker_fte_fraction
    CHECK (fte_fraction > 0 AND fte_fraction <= 1),

  CONSTRAINT ck_worker_effective_range
    CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE INDEX idx_workers_legal_entity
  ON workers (legal_entity_id);

CREATE INDEX idx_workers_external_id
  ON workers (external_id);

CREATE INDEX idx_workers_status
  ON workers (status);

-- ============================================================
-- pay_snapshots
-- Immutable records of a reporting population at a point in time.
-- Once SEALED, no associated pay_components may be modified.
-- ============================================================

CREATE TABLE pay_snapshots (
  id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_entity_id      UUID            NOT NULL REFERENCES legal_entities (id),
  period_code          VARCHAR(32)     NOT NULL,
  period_start         DATE            NOT NULL,
  period_end           DATE            NOT NULL,
  methodology_version  VARCHAR(64)     NOT NULL,
  rule_pack_version    VARCHAR(64)     NOT NULL,
  status               snapshot_status NOT NULL DEFAULT 'DRAFT',
  created_by           VARCHAR(256)    NOT NULL,
  sealed_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ     NOT NULL DEFAULT now(),

  CONSTRAINT ck_snapshot_period_range
    CHECK (period_end > period_start),

  CONSTRAINT ck_snapshot_sealed_at
    CHECK (
      (status = 'SEALED' AND sealed_at IS NOT NULL) OR
      (status != 'SEALED' AND sealed_at IS NULL)
    )
);

CREATE INDEX idx_pay_snapshots_legal_entity
  ON pay_snapshots (legal_entity_id);

CREATE INDEX idx_pay_snapshots_status
  ON pay_snapshots (status);

CREATE INDEX idx_pay_snapshots_period
  ON pay_snapshots (period_code);

-- ============================================================
-- pay_components
-- Single typed pay elements for a worker within a snapshot period.
-- Immutable once the parent snapshot is SEALED.
-- ============================================================

CREATE TABLE pay_components (
  id               UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID               NOT NULL REFERENCES workers (id),
  snapshot_id      UUID               NOT NULL REFERENCES pay_snapshots (id),
  component_type   pay_component_type NOT NULL,
  source_label     VARCHAR(256)       NOT NULL,
  raw_amount       NUMERIC(18, 4)     NOT NULL,
  currency_code    VARCHAR(3)         NOT NULL,
  period_code      pay_period_code    NOT NULL,
  is_fte_proratable BOOLEAN           NOT NULL DEFAULT true,
  effective_from   DATE               NOT NULL,
  effective_to     DATE,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT now()
);

CREATE INDEX idx_pay_components_worker
  ON pay_components (worker_id);

CREATE INDEX idx_pay_components_snapshot
  ON pay_components (snapshot_id);

CREATE INDEX idx_pay_components_type
  ON pay_components (component_type);

-- ============================================================
-- snapshot_manifests
-- Aggregate counts and integrity metadata generated at seal time.
-- 1:1 with pay_snapshots. Immutable once created.
-- ============================================================

CREATE TABLE snapshot_manifests (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id         UUID         NOT NULL UNIQUE REFERENCES pay_snapshots (id),
  worker_count        INTEGER      NOT NULL,
  pay_component_count INTEGER      NOT NULL,
  source_ref          VARCHAR(512),
  checksum_algorithm  VARCHAR(32)  NOT NULL,
  checksum            VARCHAR(128) NOT NULL,
  generated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT ck_manifest_worker_count
    CHECK (worker_count >= 0),

  CONSTRAINT ck_manifest_component_count
    CHECK (pay_component_count >= 0)
);

-- ============================================================
-- source_lineage_refs
-- Traceability links from a snapshot back to source data files.
-- N:1 with pay_snapshots (a snapshot may be built from multiple sources).
-- Immutable once created.
-- ============================================================

CREATE TABLE source_lineage_refs (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id      UUID         NOT NULL REFERENCES pay_snapshots (id),
  source_ref       VARCHAR(512) NOT NULL,
  mapping_version  VARCHAR(64)  NOT NULL,
  record_count     INTEGER      NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT ck_lineage_record_count
    CHECK (record_count >= 0)
);

CREATE INDEX idx_source_lineage_refs_snapshot
  ON source_lineage_refs (snapshot_id);
