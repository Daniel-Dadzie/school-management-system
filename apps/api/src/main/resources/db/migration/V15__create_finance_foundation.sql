-- ============================================================
-- V15__create_finance_foundation.sql
-- CarePoint School Management System - Finance Domain Schema
-- ============================================================

CREATE TABLE fee_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, name)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID NOT NULL REFERENCES students(id),
    academic_year_id UUID REFERENCES academic_years(id),
    term_id UUID REFERENCES terms(id),
    invoice_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, invoice_number),
    CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'))
);

CREATE TABLE charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID NOT NULL REFERENCES students(id),
    invoice_id UUID REFERENCES invoices(id),
    fee_category_id UUID NOT NULL REFERENCES fee_categories(id),
    academic_year_id UUID REFERENCES academic_years(id),
    term_id UUID REFERENCES terms(id),
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (amount > 0),
    CHECK (status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'))
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID NOT NULL REFERENCES students(id),
    amount NUMERIC(19, 4) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(255),
    payment_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (amount > 0),
    CHECK (status IN ('PENDING', 'VERIFIED', 'FAILED', 'REVERSED'))
);

CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    charge_id UUID NOT NULL REFERENCES charges(id),
    amount NUMERIC(19, 4) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (amount > 0)
);

CREATE TABLE financial_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    student_id UUID NOT NULL REFERENCES students(id),
    charge_id UUID REFERENCES charges(id),
    amount NUMERIC(19, 4) NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (amount > 0),
    CHECK (type IN ('DISCOUNT', 'WAIVER', 'SCHOLARSHIP', 'CREDIT'))
);

CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    receipt_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, receipt_number)
);

-- Indexes for performance and tenant isolation
CREATE INDEX idx_fee_categories_school_id ON fee_categories(school_id);

CREATE INDEX idx_invoices_school_student ON invoices(school_id, student_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE INDEX idx_charges_school_student ON charges(school_id, student_id);
CREATE INDEX idx_charges_invoice_id ON charges(invoice_id);
CREATE INDEX idx_charges_status ON charges(status);

CREATE INDEX idx_payments_school_student ON payments(school_id, student_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_allocations_payment_id ON payment_allocations(payment_id);
CREATE INDEX idx_allocations_charge_id ON payment_allocations(charge_id);

CREATE INDEX idx_adjustments_school_student ON financial_adjustments(school_id, student_id);

CREATE INDEX idx_receipts_school_id ON receipts(school_id);
