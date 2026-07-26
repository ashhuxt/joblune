package com.joblune.backend.service;

import com.joblune.backend.dto.job.JobDtos.CreateJobRequest;
import com.joblune.backend.dto.job.JobDtos.JobResponse;
import com.joblune.backend.entity.*;
import com.joblune.backend.exception.ApiException;
import com.joblune.backend.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    private User employer;
    private Company company;

    @BeforeEach
    void setUp() {
        company = Company.builder().id(UUID.randomUUID()).name("Acme Corp").build();
        employer = User.builder()
                .id(UUID.randomUUID())
                .fullName("Jane Employer")
                .email("jane@acme.com")
                .role(Role.EMPLOYER)
                .company(company)
                .build();
    }

    @Test
    void create_succeedsForEmployerWithCompany() {
        CreateJobRequest request = new CreateJobRequest(
                "Backend Engineer", "Build cool stuff", "3+ yrs Java",
                "Hyderabad", JobType.FULL_TIME, BigDecimal.valueOf(60000), BigDecimal.valueOf(90000), "java,spring"
        );

        when(jobRepository.save(any(Job.class))).thenAnswer(inv -> {
            Job j = inv.getArgument(0);
            j.setId(UUID.randomUUID());
            return j;
        });

        JobResponse response = jobService.create(request, employer);

        assertThat(response.title()).isEqualTo("Backend Engineer");
        assertThat(response.companyId()).isEqualTo(company.getId());
    }

    @Test
    void create_rejectsNonEmployerRole() {
        User jobSeeker = User.builder().id(UUID.randomUUID()).role(Role.JOB_SEEKER).build();
        CreateJobRequest request = new CreateJobRequest(
                "Backend Engineer", "desc", "reqs", "Hyderabad", JobType.FULL_TIME, null, null, null
        );

        assertThatThrownBy(() -> jobService.create(request, jobSeeker))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Only employers");
    }

    @Test
    void delete_rejectsWhenNotOwnerOrAdmin() {
        Job job = Job.builder()
                .id(UUID.randomUUID())
                .title("Some Job")
                .company(company)
                .postedBy(employer)
                .build();

        User anotherEmployer = User.builder().id(UUID.randomUUID()).role(Role.EMPLOYER).build();

        when(jobRepository.findById(job.getId())).thenReturn(java.util.Optional.of(job));

        assertThatThrownBy(() -> jobService.delete(job.getId(), anotherEmployer))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("permission");
    }

    @Test
    void getById_throwsWhenNotFound() {
        UUID missingId = UUID.randomUUID();
        when(jobRepository.findById(missingId)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> jobService.getById(missingId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }
}
