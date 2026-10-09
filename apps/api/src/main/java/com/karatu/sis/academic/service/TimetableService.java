package com.karatu.sis.academic.service;

import com.karatu.sis.academic.domain.*;
import com.karatu.sis.academic.dto.*;
import com.karatu.sis.academic.repository.*;
import com.karatu.sis.people.domain.Teacher;
import com.karatu.sis.people.repository.TeacherRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TimetableService {

    private final TimetablePeriodRepository periodRepository;
    private final TimetableEntryRepository entryRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TermRepository termRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    public TimetableService(
            TimetablePeriodRepository periodRepository,
            TimetableEntryRepository entryRepository,
            AcademicYearRepository academicYearRepository,
            TermRepository termRepository,
            SchoolClassRepository schoolClassRepository,
            SubjectRepository subjectRepository,
            TeacherRepository teacherRepository) {
        this.periodRepository = periodRepository;
        this.entryRepository = entryRepository;
        this.academicYearRepository = academicYearRepository;
        this.termRepository = termRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
    }

    // -------------------------------------------------------------------------
    // Periods
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<TimetablePeriodDTO> getPeriods() {
        UUID schoolId = TenantContext.requireSchoolId();
        return periodRepository.findBySchoolIdOrderBySortOrderAsc(schoolId)
                .stream()
                .map(this::toPeriodDTO)
                .collect(Collectors.toList());
    }

    public TimetablePeriodDTO createPeriod(TimetablePeriodRequestDTO request) {
        TimetablePeriod period = new TimetablePeriod();
        period.setName(request.name());
        period.setStartTime(request.startTime());
        period.setEndTime(request.endTime());
        period.setType(request.type() != null ? request.type() : TimetablePeriodType.LESSON);
        period.setSortOrder(request.sortOrder());
        return toPeriodDTO(periodRepository.save(period));
    }

    public TimetablePeriodDTO updatePeriod(UUID periodId, TimetablePeriodRequestDTO request) {
        UUID schoolId = TenantContext.requireSchoolId();
        TimetablePeriod period = periodRepository.findByIdAndSchoolId(periodId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Period not found"));
        period.setName(request.name());
        period.setStartTime(request.startTime());
        period.setEndTime(request.endTime());
        if (request.type() != null) period.setType(request.type());
        period.setSortOrder(request.sortOrder());
        return toPeriodDTO(periodRepository.save(period));
    }

    public void deletePeriod(UUID periodId) {
        UUID schoolId = TenantContext.requireSchoolId();
        TimetablePeriod period = periodRepository.findByIdAndSchoolId(periodId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Period not found"));
        periodRepository.delete(period);
    }

    // -------------------------------------------------------------------------
    // Entries
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesForClass(UUID termId, UUID schoolClassId) {
        UUID schoolId = TenantContext.requireSchoolId();
        return entryRepository.findBySchoolIdAndTermIdAndSchoolClassId(schoolId, termId, schoolClassId)
                .stream()
                .map(this::toEntryDTO)
                .collect(Collectors.toList());
    }

    public TimetableEntryDTO createEntry(TimetableEntryRequestDTO request) {
        UUID schoolId = TenantContext.requireSchoolId();

        AcademicYear academicYear = academicYearRepository.findByIdAndSchoolId(request.academicYearId(), schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Academic year not found"));
        Term term = termRepository.findByIdAndSchoolId(request.termId(), schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Term not found"));
        SchoolClass schoolClass = schoolClassRepository.findByIdAndSchoolId(request.schoolClassId(), schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        TimetablePeriod period = periodRepository.findByIdAndSchoolId(request.periodId(), schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Period not found"));

        // Teacher conflict check
        if (request.teacherId() != null) {
            boolean conflict = entryRepository.existsTeacherConflict(
                    schoolId, request.termId(), request.periodId(),
                    request.dayOfWeek(), request.teacherId(), null);
            if (conflict) {
                throw new IllegalStateException(
                        "Teacher is already assigned to another class in this period/day. Resolve the conflict before saving.");
            }
        }

        TimetableEntry entry = new TimetableEntry();
        entry.setAcademicYear(academicYear);
        entry.setTerm(term);
        entry.setSchoolClass(schoolClass);
        entry.setPeriod(period);
        entry.setDayOfWeek(request.dayOfWeek());

        if (request.subjectId() != null) {
            Subject subject = subjectRepository.findByIdAndSchoolId(request.subjectId(), schoolId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
            entry.setSubject(subject);
        }

        if (request.teacherId() != null) {
            Teacher teacher = teacherRepository.findByIdAndSchoolId(request.teacherId(), schoolId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            entry.setTeacher(teacher);
        }

        entry.setActivityName(request.activityName());

        try {
            return toEntryDTO(entryRepository.save(entry));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException(
                    "This class already has an entry in this period/day. Remove the existing entry first.");
        }
    }

    public void deleteEntry(UUID entryId) {
        UUID schoolId = TenantContext.requireSchoolId();
        TimetableEntry entry = entryRepository.findByIdAndSchoolId(entryId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable entry not found"));
        entryRepository.delete(entry);
    }

    // -------------------------------------------------------------------------
    // Mappers
    // -------------------------------------------------------------------------

    private TimetablePeriodDTO toPeriodDTO(TimetablePeriod p) {
        return new TimetablePeriodDTO(
                p.getId(), p.getName(), p.getStartTime(), p.getEndTime(),
                p.getType(), p.getSortOrder());
    }

    private TimetableEntryDTO toEntryDTO(TimetableEntry e) {
        return new TimetableEntryDTO(
                e.getId(),
                e.getTerm().getId(),
                e.getSchoolClass().getId(),
                e.getSchoolClass().getName(),
                e.getPeriod().getId(),
                e.getPeriod().getName(),
                e.getDayOfWeek(),
                e.getSubject() != null ? e.getSubject().getId() : null,
                e.getSubject() != null ? e.getSubject().getName() : null,
                e.getTeacher() != null ? e.getTeacher().getId() : null,
                e.getTeacher() != null ? teacherDisplayName(e.getTeacher()) : null,
                e.getActivityName()
        );
    }

    private String teacherDisplayName(com.karatu.sis.people.domain.Teacher teacher) {
        return teacher.getFirstName() + " " + teacher.getLastName();
    }
}
