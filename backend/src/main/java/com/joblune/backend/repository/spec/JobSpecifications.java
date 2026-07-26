package com.joblune.backend.repository.spec;

import com.joblune.backend.dto.job.JobDtos.JobSearchFilter;
import com.joblune.backend.entity.Job;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecifications {

    private JobSpecifications() {}

    public static Specification<Job> fromFilter(JobSearchFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only show active jobs on public listing
            predicates.add(cb.isTrue(root.get("active")));

            if (filter.keyword() != null && !filter.keyword().isBlank()) {
                String like = "%" + filter.keyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }

            if (filter.location() != null && !filter.location().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + filter.location().toLowerCase() + "%"));
            }

            if (filter.type() != null) {
                predicates.add(cb.equal(root.get("type"), filter.type()));
            }

            if (filter.tag() != null && !filter.tag().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("tags")), "%" + filter.tag().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
