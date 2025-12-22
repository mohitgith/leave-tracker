package com.leavetracker.controller;

import com.leavetracker.model.LeaveRecord;
import com.leavetracker.repository.JsonDatabaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private JsonDatabaseRepository repository;

    @GetMapping
    public List<LeaveRecord> getAllLeaves() {
        return repository.getAllLeaves();
    }

    @PostMapping
    public ResponseEntity<?> createLeave(@RequestBody LeaveRecord leave) {
        // Basic validation
        if (leave.getId() == null || leave.getId().isEmpty() ||
                leave.getEmployeeId() == null || leave.getEmployeeId().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid leave data"));
        }

        LeaveRecord created = repository.createLeave(leave);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeave(@PathVariable String id, @RequestBody LeaveRecord leave) {
        return repository.updateLeave(id, leave)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable String id) {
        if (repository.deleteLeave(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
