package com.leavetracker.controller;

import com.leavetracker.model.Employee;
import com.leavetracker.model.LeaveRecord;
import com.leavetracker.repository.EmployeeRepository;
import com.leavetracker.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dashboard controller for aggregated stats and leave overview.
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Get dashboard statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        LocalDate today = LocalDate.now();
        String todayStr = today.format(DATE_FORMAT);

        // Count employees absent today
        List<LeaveRecord> todayLeaves = leaveRepository.findByDate(todayStr);
        int absentToday = todayLeaves.size();

        // Count pending requests
        long pendingRequests = leaveRepository.countByStatus("Applied");

        // Get total employees
        long totalEmployees = employeeRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("absentToday", absentToday);
        stats.put("pendingRequests", pendingRequests);
        stats.put("totalEmployees", totalEmployees);
        stats.put("upcomingHoliday", Map.of(
                "name", "New Year's Day",
                "date", "Jan 1 (Wednesday)"));

        return ResponseEntity.ok(stats);
    }

    /**
     * Get employees on leave today with their details.
     */
    @GetMapping("/absent-today")
    public ResponseEntity<List<Map<String, Object>>> getAbsentToday() {
        LocalDate today = LocalDate.now();
        String todayStr = today.format(DATE_FORMAT);

        List<LeaveRecord> todayLeaves = leaveRepository.findByDate(todayStr);

        List<Map<String, Object>> result = todayLeaves.stream()
                .map(leave -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("leave", leave);

                    employeeRepository.findById(leave.getEmployeeId()).ifPresent(emp -> {
                        item.put("employeeName", emp.getName());
                        item.put("employeeRole", emp.getRole());
                        item.put("avatarUrl", emp.getAvatarUrl());
                    });

                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get upcoming leaves (tomorrow and next week).
     */
    @GetMapping("/upcoming-leaves")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getUpcomingLeaves() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate nextWeekStart = today.plusDays(2);
        LocalDate nextWeekEnd = today.plusDays(7);

        String tomorrowStr = tomorrow.format(DATE_FORMAT);
        String nextWeekStartStr = nextWeekStart.format(DATE_FORMAT);
        String nextWeekEndStr = nextWeekEnd.format(DATE_FORMAT);

        // Tomorrow's leaves
        List<LeaveRecord> tomorrowLeaves = leaveRepository.findByDate(tomorrowStr);
        List<Map<String, Object>> tomorrowResult = mapLeavesWithEmployees(tomorrowLeaves);

        // Next week's leaves
        List<LeaveRecord> nextWeekLeaves = leaveRepository.findByDateRange(nextWeekStartStr, nextWeekEndStr);
        List<Map<String, Object>> nextWeekResult = mapLeavesWithEmployees(nextWeekLeaves);

        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        result.put("tomorrow", tomorrowResult);
        result.put("nextWeek", nextWeekResult);

        return ResponseEntity.ok(result);
    }

    /**
     * Get department absence rate.
     */
    @GetMapping("/department-absence")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentAbsence() {
        LocalDate today = LocalDate.now();
        String todayStr = today.format(DATE_FORMAT);

        // Get all employees grouped by department
        List<Employee> employees = employeeRepository.findAll();
        Map<String, Long> deptTotals = employees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

        // Get absent employees today
        List<LeaveRecord> todayLeaves = leaveRepository.findByDate(todayStr);
        Set<String> absentEmployeeIds = todayLeaves.stream()
                .map(LeaveRecord::getEmployeeId)
                .collect(Collectors.toSet());

        // Count absent by department
        Map<String, Long> deptAbsent = employees.stream()
                .filter(e -> e.getDepartment() != null && absentEmployeeIds.contains(e.getId()))
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

        // Calculate percentages
        List<Map<String, Object>> result = deptTotals.entrySet().stream()
                .map(entry -> {
                    String dept = entry.getKey();
                    long total = entry.getValue();
                    long absent = deptAbsent.getOrDefault(dept, 0L);
                    int percentage = total > 0 ? (int) ((absent * 100) / total) : 0;

                    Map<String, Object> deptData = new HashMap<>();
                    deptData.put("department", dept);
                    deptData.put("total", total);
                    deptData.put("absent", absent);
                    deptData.put("percentage", percentage);
                    return deptData;
                })
                .sorted((a, b) -> Integer.compare((int) b.get("percentage"), (int) a.get("percentage")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get pending leave requests.
     */
    @GetMapping("/pending-requests")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests() {
        List<LeaveRecord> pendingLeaves = leaveRepository.findByStatus("Applied");
        List<Map<String, Object>> result = mapLeavesWithEmployees(pendingLeaves);
        return ResponseEntity.ok(result);
    }

    private List<Map<String, Object>> mapLeavesWithEmployees(List<LeaveRecord> leaves) {
        return leaves.stream()
                .map(leave -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("leave", leave);

                    employeeRepository.findById(leave.getEmployeeId()).ifPresent(emp -> {
                        item.put("employeeName", emp.getName());
                        item.put("employeeRole", emp.getRole());
                        item.put("avatarUrl", emp.getAvatarUrl());
                        item.put("department", emp.getDepartment());
                    });

                    return item;
                })
                .collect(Collectors.toList());
    }
}
