-- ============================================================
-- Equipment Management System — Database Schema
-- ============================================================

-- Drop tables in reverse dependency order (for re-runs)
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS equipment       CASCADE;
DROP TABLE IF EXISTS equipment_types CASCADE;

-- ------------------------------------------------------------
-- 1. Equipment Types  (dynamic — no hardcoded values)
-- ------------------------------------------------------------
CREATE TABLE equipment_types (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. Equipment
-- ------------------------------------------------------------
CREATE TABLE equipment (
    id                BIGSERIAL    PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    type_id           BIGINT       NOT NULL
                          REFERENCES equipment_types(id) ON DELETE RESTRICT,
    status            VARCHAR(20)  NOT NULL
                          CONSTRAINT chk_equipment_status
                          CHECK (status IN ('Active', 'Inactive', 'Under Maintenance')),
    last_cleaned_date DATE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 3. Maintenance Logs
-- ------------------------------------------------------------
CREATE TABLE maintenance_logs (
    id               BIGSERIAL    PRIMARY KEY,
    equipment_id     BIGINT       NOT NULL
                         REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_date DATE         NOT NULL,
    notes            TEXT,
    performed_by     VARCHAR(255) NOT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Indexes for common query patterns
-- ------------------------------------------------------------
CREATE INDEX idx_equipment_type_id       ON equipment(type_id);
CREATE INDEX idx_equipment_status        ON equipment(status);
CREATE INDEX idx_maintenance_equipment   ON maintenance_logs(equipment_id);
CREATE INDEX idx_maintenance_date        ON maintenance_logs(maintenance_date);

-- ------------------------------------------------------------
-- Seed Data — Equipment Types
-- ------------------------------------------------------------
INSERT INTO equipment_types (name) VALUES
    ('HVAC'),
    ('Electrical'),
    ('Plumbing'),
    ('Mechanical'),
    ('Safety'),
    ('IT Infrastructure');
