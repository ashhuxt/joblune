package com.joblune.backend.controller;

import com.joblune.backend.service.FileUploadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Tag(name = "Uploads", description = "Resume file uploads")
public class UploadController {

    private final FileUploadService fileUploadService;

    @PostMapping(value = "/resume", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<Map<String, String>> uploadResume(@RequestParam("file") MultipartFile file) {
        String url = fileUploadService.uploadResume(file);
        return ResponseEntity.ok(Map.of("resumeUrl", url));
    }
}
