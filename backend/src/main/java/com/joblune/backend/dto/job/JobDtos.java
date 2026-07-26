package com.joblune.backend.dto.job;

import com.joblune.backend.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class JobDtos {

    public record CreateJobRequest(
            @NotBlank String title,
            @NotBlank String description,
            String requirements,
            @NotBlank String location,
            @NotNull(message = "Job type is required and must be one of FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, or REMOTE") JobType type,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String tags
    ) {}

    public record UpdateJobRequest(
            String title,
            String description,
            String requirements,
            String location,
            JobType type,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String tags,
            Boolean active
    ) {}

    public record JobResponse(
            UUID id,
            String title,
            String description,
            String requirements,
            String location,
            JobType type,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String tags,
            boolean active,
            UUID companyId,
            String companyName,
            String companyLogoUrl,
            UUID postedById,
            Instant createdAt
    ) {}

    public record JobSearchFilter(
            String keyword,
            String location,
            JobType type,
            String tag
    ) {}
}
