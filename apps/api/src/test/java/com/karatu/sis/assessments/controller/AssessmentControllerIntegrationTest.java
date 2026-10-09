package com.karatu.sis.assessments.controller;

import com.karatu.sis.academic.domain.*;
import com.karatu.sis.academic.dto.AssessmentCreateRequest;
import com.karatu.sis.academic.repository.*;
import com.karatu.sis.academic.repository.AssessmentRepository;
import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserRepository;
import com.karatu.sis.people.domain.Teacher;
import com.karatu.sis.people.repository.TeacherRepository;
import com.karatu.sis.assessments.domain.AssessmentCategory;
import com.karatu.sis.assessments.repository.AssessmentCategoryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class AssessmentControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AssessmentRepository assessmentRepository;
    @Autowired
    private AssessmentCategoryRepository assessmentCategoryRepository;
    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private SchoolClassRepository schoolClassRepository;
    @Autowired
    private AcademicYearRepository academicYearRepository;
    @Autowired
    private TermRepository termRepository;


    @BeforeEach
    void setUp() {
        com.karatu.sis.tenant.TenantContext.setSchoolId(java.util.UUID.fromString("00000000-0000-0000-0000-000000000001"));
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @AfterEach
    void tearDown() {
        com.karatu.sis.tenant.TenantContext.setSchoolId(java.util.UUID.fromString("00000000-0000-0000-0000-000000000001"));
        assessmentRepository.deleteAll();
        assessmentCategoryRepository.deleteAll();
        teacherAssignmentRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();
        subjectRepository.deleteAll();
        schoolClassRepository.deleteAll();
        termRepository.deleteAll();
        academicYearRepository.deleteAll();
        com.karatu.sis.tenant.TenantContext.clear();
    }

    @Test
    void createAssessment_WithValidTeacherAssignment_ReturnsCreated() throws Exception {
        User teacherUser = new User();
        teacherUser.setEmail("t1@test.com");
        teacherUser.setUsername("t1");
        teacherUser.setPasswordHash("hash");
        teacherUser.setRole(Role.TEACHER);
        teacherUser = userRepository.save(teacherUser);

        Teacher t1 = new Teacher();
        t1.setUser(teacherUser);
        t1.setStaffNumber("T1");
        t1.setFirstName("J");
        t1.setLastName("D");
        t1 = teacherRepository.save(t1);

        Subject sub = new Subject();
        sub.setName("Math");
        sub.setCode("M");
        sub = subjectRepository.save(sub);

        SchoolClass cls = new SchoolClass();
        cls.setName("C1");
        cls.setLevel("L");
        cls = schoolClassRepository.save(cls);

        AcademicYear year = new AcademicYear();
        year.setName("Y1");
        year.setStartDate(LocalDate.now());
        year.setEndDate(LocalDate.now().plusMonths(1));
        year = academicYearRepository.save(year);

        Term term = new Term();
        term.setName("T1");
        term.setAcademicYear(year);
        term.setStartDate(LocalDate.now());
        term.setEndDate(LocalDate.now().plusMonths(1));
        term.setMandatory(true);
        term = termRepository.save(term);

        TeacherAssignment ta = new TeacherAssignment();
        ta.setTeacher(t1);
        ta.setSubject(sub);
        ta.setSchoolClass(cls);
        ta.setAcademicYear(year);
        ta.setTerm(term);
        ta = teacherAssignmentRepository.save(ta);

        AssessmentCategory category = new AssessmentCategory();
        category.setName("Exam");
        category.setCode("EXAM");
        category = assessmentCategoryRepository.save(category);

        String jsonRequest = String.format("""
                {
                    "title": "Midterm",
                    "teacherAssignmentId": "%s",
                    "categoryId": "%s",
                    "description": "Midterm Exam",
                    "assessmentDate": "%s",
                    "maximumScore": 100.0,
                    "weightPercent": 30.0,
                    "isCurrentFinal": false
                }""", ta.getId(), category.getId(), LocalDate.now());

        mockMvc.perform(post("/api/v1/assessments")
                        .with(SecurityMockMvcRequestPostProcessors.user(teacherUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Midterm"))
                .andExpect(jsonPath("$.teacherAssignmentId").value(ta.getId().toString()));
    }
}
