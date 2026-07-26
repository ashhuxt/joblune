package com.joblune.backend.dto.application;

import com.joblune.backend.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class ApplicationDtos {

    public record ApplyRequest(
            @NotNull UUID jobId,
            @NotBlank String resumeUrl,
            String coverNote
    ) {}

    public record UpdateStatusRequest(
            @NotNull ApplicationStatus status
    ) {}

    public record ApplicationResponse(
            UUID id,
            UUID jobId,
            String jobTitle,
            UUID applicantId,
            String applicantName,
            String applicantEmail,
            String resumeUrl,
            String coverNote,
            ApplicationStatus status,
            Instant createdAt
    ) {}
}
