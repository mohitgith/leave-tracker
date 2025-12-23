package com.leavetracker.repository;

import com.leavetracker.model.LeaveRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRecord, String> {

    // Find leaves by employee ID
    List<LeaveRecord> findByEmployeeId(String employeeId);

    // Find leaves by status
    List<LeaveRecord> findByStatus(String status);

    // Find leaves within a date range (for scheduling view)
    @Query("SELECT l FROM LeaveRecord l WHERE l.startDate <= :endDate AND l.endDate >= :startDate")
    List<LeaveRecord> findByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // Find leaves for a specific date (employees on leave today)
    @Query("SELECT l FROM LeaveRecord l WHERE l.startDate <= :date AND l.endDate >= :date")
    List<LeaveRecord> findByDate(@Param("date") String date);

    // Count pending requests
    long countByStatus(String status);

    // Find leaves by type
    List<LeaveRecord> findByType(String type);
}
