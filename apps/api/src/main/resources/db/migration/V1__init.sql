-- ============================================================
-- V1__init.sql
-- CarePoint School Management System — Baseline Migration
-- ============================================================
-- This is the first Flyway migration.
-- It establishes the PostgreSQL extensions required by the
-- application. All application tables will be created in
-- subsequent migrations as entities are implemented.
-- ============================================================

-- Enable UUID generation support
-- Used for primary keys (uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions
-- Used for secure token generation and hashing utilities
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

