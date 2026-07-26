package com.joblune.backend.service;

import com.joblune.backend.dto.job.JobDtos.*;
import com.joblune.backend.entity.Job;
import com.joblune.backend.entity.Role;
import com.joblune.backend.entity.User;
import com.joblune.backend.exception.ApiException;
import com.joblune.backend.repository.JobRepository;
import com.joblune.backend.repository.spec.JobSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public Page<JobResponse> search(JobSearchFilter filter, Pageable pageable) {
        return jobRepository.findAll(JobSpecifications.fromFilter(filter), pageable)
                .map(this::toResponse);
    }

    public JobResponse getById(UUID id) {
        return toResponse(findJobOrThrow(id));
    }

    public java.util.List<JobResponse> getMyJobs(User employer) {
        requireEmployer(employer);
        return jobRepository.findByPostedById(employer.getId())
                .stream().map(this::toResponse).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = false)
    public JobResponse create(CreateJobRequest request, User employer) {
        requireEmployer(employer);
        if (employer.getCompany() == null) {
            throw ApiException.badRequest("Employer has no associated company");
        }

        Job job = Job.builder()
                .title(request.title())
                .description(request.description())
                .requirements(request.requirements())
                .location(request.location())
                .type(request.type())
                .salaryMin(request.salaryMin())
                .salaryMax(request.salaryMax())
                .tags(request.tags())
                .active(true)
                .company(employer.getCompany())
                .postedBy(employer)
                .build();

        return toResponse(jobRepository.save(job));
    }

    @Transactional
    public JobResponse update(UUID jobId, UpdateJobRequest request, User employer) {
        Job job = findJobOrThrow(jobId);
        requireOwnerOrAdmin(job, employer);

        if (request.title() != null) job.setTitle(request.title());
        if (request.description() != null) job.setDescription(request.description());
        if (request.requirements() != null) job.setRequirements(request.requirements());
        if (request.location() != null) job.setLocation(request.location());
        if (request.type() != null) job.setType(request.type());
        if (request.salaryMin() != null) job.setSalaryMin(request.salaryMin());
        if (request.salaryMax() != null) job.setSalaryMax(request.salaryMax());
        if (request.tags() != null) job.setTags(request.tags());
        if (request.active() != null) job.setActive(request.active());

        return toResponse(jobRepository.save(job));
    }

    @Transactional
    public void delete(UUID jobId, User employer) {
        Job job = findJobOrThrow(jobId);
        requireOwnerOrAdmin(job, employer);
        jobRepository.delete(job);
    }

    private Job findJobOrThrow(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Job not found: " + id));
    }

    private void requireEmployer(User user) {
        if (user.getRole() != Role.EMPLOYER) {
            throw ApiException.forbidden("Only employers can perform this action");
        }
    }

    private void requireOwnerOrAdmin(Job job, User user) {
        boolean isOwner = job.getPostedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw ApiException.forbidden("You do not have permission to modify this job");
        }
    }

    private JobResponse toResponse(Job job) {
        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getRequirements(),
                job.getLocation(),
                job.getType(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getTags(),
                job.isActive(),
                job.getCompany().getId(),
                job.getCompany().getName(),
                job.getCompany().getLogoUrl(),
                job.getPostedBy().getId(),
                job.getCreatedAt()
        );
    }
}
