package com.leavetracker.controller;

import com.leavetracker.model.OrgEmployeeDTO;
import com.leavetracker.service.OrgChartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/org-chart")
public class OrgChartController {

    @Autowired
    private OrgChartService orgChartService;

    @GetMapping
    public OrgEmployeeDTO getOrgChart() {
        return orgChartService.getOrgChart();
    }
}
