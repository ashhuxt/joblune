package com.joblune.backend.controller;

import com.joblune.backend.dto.application.ApplicationDtos.*;
import com.joblune.backend.entity.User;
import com.joblune.backend.service.ApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Apply to jobs and manage application status")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApplicationResponse> apply(
            @Valid @RequestBody ApplyRequest request,
            @AuthenticationPrincipal User applicant
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.apply(request, applicant));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<ApplicationResponse>> myApplications(@AuthenticationPrincipal User applicant) {
        return ResponseEntity.ok(applicationService.getMyApplications(applicant));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> applicantsForJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal User employer
    ) {
        return ResponseEntity.ok(applicationService.getApplicantsForJob(jobId, employer));
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable UUID applicationId,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal User employer
    ) {
        return ResponseEntity.ok(applicationService.updateStatus(applicationId, request, employer));
    }
}
