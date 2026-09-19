package com.schoolmanagement.people.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "parent_student")
public class ParentStudent {

    @EmbeddedId
    private ParentStudentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("parentId")
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", nullable = false, length = 50)
    private RelationshipType relationshipType;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    @Column(name = "is_emergency_contact", nullable = false)
    private boolean isEmergencyContact = false;

    public ParentStudent() {}

    public ParentStudent(Parent parent, Student student, RelationshipType relationshipType) {
        this.id = new ParentStudentId(parent.getId(), student.getId());
        this.parent = parent;
        this.student = student;
        this.relationshipType = relationshipType;
    }

    // --- Getters & Setters ---

    public ParentStudentId getId() { return id; }
    public void setId(ParentStudentId id) { this.id = id; }

    public Parent getParent() { return parent; }
    public void setParent(Parent parent) { this.parent = parent; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public RelationshipType getRelationshipType() { return relationshipType; }
    public void setRelationshipType(RelationshipType relationshipType) { this.relationshipType = relationshipType; }

    public boolean isPrimary() { return isPrimary; }
    public void setPrimary(boolean primary) { isPrimary = primary; }

    public boolean isEmergencyContact() { return isEmergencyContact; }
    public void setEmergencyContact(boolean emergencyContact) { isEmergencyContact = emergencyContact; }
}

