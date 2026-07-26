package com.joblune.backend.service;

import com.joblune.backend.dto.application.ApplicationDtos.*;
import com.joblune.backend.entity.*;
import com.joblune.backend.exception.ApiException;
import com.joblune.backend.repository.ApplicationRepository;
import com.joblune.backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    @Transactional
    public ApplicationResponse apply(ApplyRequest request, User applicant) {
        if (applicant.getRole() != Role.JOB_SEEKER) {
            throw ApiException.forbidden("Only job seekers can apply to jobs");
        }

        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> ApiException.notFound("Job not found: " + request.jobId()));

        if (!job.isActive()) {
            throw ApiException.badRequest("This job is no longer accepting applications");
        }

        if (applicationRepository.existsByApplicantIdAndJobId(applicant.getId(), job.getId())) {
            throw ApiException.conflict("You have already applied to this job");
        }

        Application application = Application.builder()
                .job(job)
                .applicant(applicant)
                .resumeUrl(request.resumeUrl())
                .coverNote(request.coverNote())
                .status(ApplicationStatus.APPLIED)
                .build();

        return toResponse(applicationRepository.save(application));
    }

    public List<ApplicationResponse> getMyApplications(User applicant) {
        return applicationRepository.findByApplicantId(applicant.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicantsForJob(UUID jobId, User employer) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> ApiException.notFound("Job not found: " + jobId));

        requireOwnerOrAdmin(job, employer);

        return applicationRepository.findByJobId(jobId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse updateStatus(UUID applicationId, UpdateStatusRequest request, User employer) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Application not found: " + applicationId));

        requireOwnerOrAdmin(application.getJob(), employer);

        application.setStatus(request.status());
        return toResponse(applicationRepository.save(application));
    }

    private void requireOwnerOrAdmin(Job job, User user) {
        boolean isOwner = job.getPostedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw ApiException.forbidden("You do not have permission to view or modify this job's applications");
        }
    }

    private ApplicationResponse toResponse(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getJob().getId(),
                application.getJob().getTitle(),
                application.getApplicant().getId(),
                application.getApplicant().getFullName(),
                application.getApplicant().getEmail(),
                application.getResumeUrl(),
                application.getCoverNote(),
                application.getStatus(),
                application.getCreatedAt()
        );
    }
}
