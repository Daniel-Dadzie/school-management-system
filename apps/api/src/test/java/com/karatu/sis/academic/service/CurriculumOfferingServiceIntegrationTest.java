package com.karatu.sis.academic.service;

import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.CurriculumOffering;
import com.karatu.sis.academic.domain.Subject;
import com.karatu.sis.academic.dto.CurriculumOfferingRequest;
import com.karatu.sis.academic.dto.CurriculumOfferingResponse;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.CurriculumOfferingRepository;
import com.karatu.sis.academic.repository.SubjectRepository;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserRepository;
import com.karatu.sis.tenant.TenantContext;
import com.karatu.sis.tenant.domain.School;
import com.karatu.sis.tenant.repository.SchoolRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.junit.jupiter.Container;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
@Transactional
class CurriculumOfferingServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private CurriculumOfferingService curriculumOfferingService;

    @Autowired
    private CurriculumOfferingRepository curriculumOfferingRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserRepository userRepository;

    private School school;
    private User admin;
    private AcademicYear academicYear;
    private Subject subject;

    @BeforeEach
    void setUp() {
        school = new School();
        school.setName("Test School");
        school.setSlug("test-school");
        school.setAddress("123 Test St");
        school.setEmail("test@school.com");
        school = schoolRepository.save(school);

        TenantContext.setSchoolId(school.getId());

        academicYear = new AcademicYear();
        academicYear.setName("2026/2027");
        academicYear.setStartDate(LocalDate.of(2026, 9, 1));
        academicYear.setEndDate(LocalDate.of(2027, 7, 31));
        academicYear = academicYearRepository.save(academicYear);

        subject = new Subject();
        subject.setName("Mathematics");
        subject.setCode("MATH101");
        subject = subjectRepository.save(subject);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void shouldCreateCurriculumOffering() {
        CurriculumOfferingRequest request = new CurriculumOfferingRequest(
                academicYear.getId(),
                "Basic 6",
                subject.getId(),
                true,
                true,
                5,
                true,
                true
        );

        CurriculumOfferingResponse response = curriculumOfferingService.createOffering(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.gradeLevel()).isEqualTo("Basic 6");
        assertThat(response.subject().name()).isEqualTo("Mathematics");
        assertThat(response.isRequired()).isTrue();
        assertThat(response.periodsPerWeek()).isEqualTo(5);

        List<CurriculumOffering> saved = curriculumOfferingRepository.findAllBySchoolIdAndAcademicYearId(school.getId(), academicYear.getId());
        assertThat(saved).hasSize(1);
    }

    @Test
    void shouldNotCreateDuplicateOffering() {
        CurriculumOfferingRequest request = new CurriculumOfferingRequest(
                academicYear.getId(),
                "Basic 6",
                subject.getId(),
                true,
                true,
                5,
                true,
                true
        );

        curriculumOfferingService.createOffering(request);

        assertThatThrownBy(() -> curriculumOfferingService.createOffering(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Subject is already offered");
    }

    @Test
    void shouldGetOfferingsForGradeLevel() {
        CurriculumOfferingRequest request = new CurriculumOfferingRequest(
                academicYear.getId(),
                "Basic 6",
                subject.getId(),
                true,
                true,
                5,
                true,
                true
        );
        curriculumOfferingService.createOffering(request);

        List<CurriculumOfferingResponse> offerings = curriculumOfferingService.getOfferingsForGrade(academicYear.getId(), "Basic 6");
        assertThat(offerings).hasSize(1);
        
        List<CurriculumOfferingResponse> otherGrade = curriculumOfferingService.getOfferingsForGrade(academicYear.getId(), "Basic 7");
        assertThat(otherGrade).isEmpty();
    }
}
