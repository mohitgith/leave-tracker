package com.leavetracker.controller;

import com.leavetracker.model.AppNotification;
import com.leavetracker.model.Employee;
import com.leavetracker.model.LeaveRecord;
import com.leavetracker.repository.EmployeeRepository;
import com.leavetracker.repository.LeaveRepository;
import com.leavetracker.repository.AppNotificationRepository;
import com.leavetracker.service.DataPersistenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/leaves")
public class LeaveController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AppNotificationRepository appNotificationRepository;

    @Autowired
    private DataPersistenceService dataPersistenceService;

    private static final String MANAGER_ID = "0"; // Lohit Ganta is the manager

    @GetMapping
    public List<LeaveRecord> getAllLeaves() {
        return leaveRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createLeave(@RequestBody LeaveRecord leave) {
        // Generate ID if not provided
        if (leave.getId() == null || leave.getId().isEmpty()) {
            leave.setId("leave-" + System.currentTimeMillis());
        }

        // Basic validation
        if (leave.getEmployeeId() == null || leave.getEmployeeId().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Employee ID is required"));
        }

        LeaveRecord created = leaveRepository.save(leave);

        // Create notification for manager when an employee applies for leave
        if (!leave.getEmployeeId().equals(MANAGER_ID)) {
            createLeaveNotification(leave);
        }

        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeave(@PathVariable String id, @RequestBody LeaveRecord leave) {
        if (!leaveRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        leave.setId(id);
        LeaveRecord updated = leaveRepository.save(leave);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable String id) {
        if (!leaveRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        leaveRepository.deleteById(id);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.noContent().build();
    }

    /**
     * Create a notification for the manager when an employee applies for leave.
     */
    private void createLeaveNotification(LeaveRecord leave) {
        Optional<Employee> employeeOpt = employeeRepository.findById(leave.getEmployeeId());
        if (employeeOpt.isEmpty())
            return;

        Employee employee = employeeOpt.get();
        String leaveType = "vacation".equalsIgnoreCase(leave.getType()) ? "Annual Leave" : "Sick Leave";

        AppNotification notification = new AppNotification(
                "notif-" + System.currentTimeMillis(),
                "leave_applied",
                "New Leave Request",
                employee.getName() + " has applied for " + leaveType +
                        " from " + leave.getStartDate() + " to " + leave.getEndDate(),
                MANAGER_ID, // For the manager
                leave.getEmployeeId(), // From the employee
                leave.getId());

        appNotificationRepository.save(notification);
    }
}
