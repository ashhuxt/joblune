package com.joblune.backend.repository;

import com.joblune.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByApplicantId(UUID applicantId);
    List<Application> findByJobId(UUID jobId);
    Optional<Application> findByApplicantIdAndJobId(UUID applicantId, UUID jobId);
    boolean existsByApplicantIdAndJobId(UUID applicantId, UUID jobId);
}
