package com.joblune.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.joblune.backend.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024; // 5MB

    public String uploadResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("No file provided");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw ApiException.badRequest("File exceeds maximum size of 5MB");
        }
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw ApiException.badRequest("Only PDF or Word documents are allowed");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "raw",
                    "folder", "joblune/resumes"
            ));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw ApiException.badRequest("Failed to upload file: " + e.getMessage());
        }
    }
}
