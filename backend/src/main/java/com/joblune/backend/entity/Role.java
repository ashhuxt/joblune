package com.joblune.backend.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Locale;

public enum Role {
    JOB_SEEKER,
    EMPLOYER,
    ADMIN;

    @JsonCreator
    public static Role fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "RECRUITER", "ROLE_RECRUITER" -> EMPLOYER;
            case "JOB_SEEKER", "ROLE_JOB_SEEKER" -> JOB_SEEKER;
            case "EMPLOYER", "ROLE_EMPLOYER" -> EMPLOYER;
            case "ADMIN", "ROLE_ADMIN" -> ADMIN;
            default -> Arrays.stream(values())
                    .filter(role -> role.name().equals(normalized))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + value));
        };
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
