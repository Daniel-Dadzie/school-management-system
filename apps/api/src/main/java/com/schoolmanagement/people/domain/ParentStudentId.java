package com.schoolmanagement.people.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class ParentStudentId implements Serializable {

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "student_id")
    private UUID studentId;

    public ParentStudentId() {}

    public ParentStudentId(UUID parentId, UUID studentId) {
        this.parentId = parentId;
        this.studentId = studentId;
    }

    public UUID getParentId() { return parentId; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ParentStudentId that)) return false;
        return Objects.equals(parentId, that.parentId) &&
               Objects.equals(studentId, that.studentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(parentId, studentId);
    }
}

