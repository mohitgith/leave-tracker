package com.leavetracker.repository;

import com.leavetracker.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, String> {

    // Find holidays strictly after given date, ordered by date ascending
    List<Holiday> findByDateAfterOrderByDateAsc(LocalDate date);

    // Find first holiday on or after given date (using Spring Data naming
    // convention)
    Optional<Holiday> findFirstByDateGreaterThanEqualOrderByDateAsc(LocalDate date);
}
