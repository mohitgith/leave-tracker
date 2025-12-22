package com.leavetracker.controller;

import com.leavetracker.model.Employee;
import com.leavetracker.repository.JsonDatabaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private JsonDatabaseRepository repository;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return repository.getAllEmployees();
    }
}
