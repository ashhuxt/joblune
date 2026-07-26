package com.joblune.backend.controller;

import com.joblune.backend.dto.job.JobDtos.*;
import com.joblune.backend.entity.JobType;
import com.joblune.backend.entity.User;
import com.joblune.backend.service.JobService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Browse, search, and manage job postings")
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<Page<JobResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) JobType type,
            @RequestParam(required = false) String tag,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        JobSearchFilter filter = new JobSearchFilter(keyword, location, type, tag);
        return ResponseEntity.ok(jobService.search(filter, pageable));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<java.util.List<JobResponse>> myJobs(@AuthenticationPrincipal User employer) {
        return ResponseEntity.ok(jobService.getMyJobs(employer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobResponse> create(
            @Valid @RequestBody CreateJobRequest request,
            @AuthenticationPrincipal User employer
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(request, employer));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    public ResponseEntity<JobResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateJobRequest request,
            @AuthenticationPrincipal User employer
    ) {
        return ResponseEntity.ok(jobService.update(id, request, employer));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal User employer) {
        jobService.delete(id, employer);
        return ResponseEntity.noContent().build();
    }
}
