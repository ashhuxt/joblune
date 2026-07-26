package com.joblune.backend.repository;

import com.joblune.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("select distinct u from User u left join fetch u.company where u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);
    boolean existsByEmail(String email);
}
