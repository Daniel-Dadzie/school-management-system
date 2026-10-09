package com.karatu.sis.academic.domain;

import com.karatu.sis.people.domain.Teacher;
import com.karatu.sis.tenant.domain.SchoolOwnedEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A single recurring weekly slot in a class timetable.
 * Represents: on DAY, during PERIOD, CLASS is taught SUBJECT by TEACHER.
 * Unique constraint prevents class double-booking at DB level.
 */
@Entity
@Table(
    name = "timetable_entries",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_timetable_class_slot",
        columnNames = {"school_id", "term_id", "school_class_id", "period_id", "day_of_week"}
    )
)
public class TimetableEntry extends SchoolOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "term_id", nullable = false)
    private Term term;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private TimetablePeriod period;

    /** 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday */
    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    /** For non-lesson activities (BREAK, ASSEMBLY, etc.) */
    @Column(name = "activity_name", length = 150)
    private String activityName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TimetableEntry() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

    public Term getTerm() { return term; }
    public void setTerm(Term term) { this.term = term; }

    public SchoolClass getSchoolClass() { return schoolClass; }
    public void setSchoolClass(SchoolClass schoolClass) { this.schoolClass = schoolClass; }

    public TimetablePeriod getPeriod() { return period; }
    public void setPeriod(TimetablePeriod period) { this.period = period; }

    public int getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(int dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public String getActivityName() { return activityName; }
    public void setActivityName(String activityName) { this.activityName = activityName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
