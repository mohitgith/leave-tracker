package com.leavetracker.controller;

import com.leavetracker.model.OrgEmployeeDTO;
import com.leavetracker.repository.JsonDatabaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/org-chart")
public class OrgChartController {

    @Autowired
    private JsonDatabaseRepository repository;

    @GetMapping
    public OrgEmployeeDTO getOrgChart() {
        return repository.getOrgChart();
    }
}
