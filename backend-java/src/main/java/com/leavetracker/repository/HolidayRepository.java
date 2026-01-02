package com.leavetracker.repository;

import com.leavetracker.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, String> {

    // Find holidays strictly after given date, ordered by date ascending
    List<Holiday> findByDateAfterOrderByDateAsc(LocalDate date);

    // Find first holiday after or on today
    @Query("SELECT h FROM Holiday h WHERE h.date >= :date ORDER BY h.date ASC LIMIT 1")
    Optional<Holiday> findNextHoliday(LocalDate date);
}
