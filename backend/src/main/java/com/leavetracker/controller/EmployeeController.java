package com.leavetracker.controller;

import com.leavetracker.model.Employee;
import com.leavetracker.repository.EmployeeRepository;
import com.leavetracker.service.DataPersistenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DataPersistenceService dataPersistenceService;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable String id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        if (employee.getId() == null || employee.getId().isEmpty()) {
            // Generate ID if not provided
            employee.setId(String.valueOf(System.currentTimeMillis()));
        }

        // Generate avatar URL if not provided
        if (employee.getAvatarUrl() == null || employee.getAvatarUrl().isEmpty()) {
            employee.setAvatarUrl("https://ui-avatars.com/api/?name=" +
                    employee.getName().replace(" ", "%20") +
                    "&background=random&color=fff&size=64&bold=true");
        }

        Employee created = employeeRepository.save(employee);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable String id, @RequestBody Employee employee) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        employee.setId(id);
        Employee updated = employeeRepository.save(employee);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        employeeRepository.deleteById(id);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.noContent().build();
    }
}
