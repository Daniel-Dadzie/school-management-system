CREATE TABLE user_management_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    actor_user_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    action VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_audit_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_user_audit_actor_school FOREIGN KEY (school_id, actor_user_id) REFERENCES users(school_id, id),
    CONSTRAINT fk_user_audit_target_school FOREIGN KEY (school_id, target_user_id) REFERENCES users(school_id, id)
);

CREATE INDEX idx_user_audit_school_created ON user_management_audit_logs (school_id, created_at DESC);
