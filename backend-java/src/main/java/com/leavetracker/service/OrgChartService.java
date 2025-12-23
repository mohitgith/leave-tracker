package com.leavetracker.service;

import com.leavetracker.model.Employee;
import com.leavetracker.model.OrgEmployeeDTO;
import com.leavetracker.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service to build the organizational chart hierarchy.
 */
@Service
public class OrgChartService {

    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Build the org chart tree structure starting from the root (manager).
     */
    public OrgEmployeeDTO getOrgChart() {
        List<Employee> allEmployees = employeeRepository.findAll();

        // Find the root employee (manager with no parent)
        Employee root = allEmployees.stream()
                .filter(e -> e.getManagerId() == null)
                .findFirst()
                .orElse(null);

        if (root == null && !allEmployees.isEmpty()) {
            // If no root found, use the first employee as root
            root = allEmployees.get(0);
        }

        if (root == null) {
            return null;
        }

        // Group employees by manager ID
        Map<String, List<Employee>> byManager = allEmployees.stream()
                .filter(e -> e.getManagerId() != null)
                .collect(Collectors.groupingBy(Employee::getManagerId));

        // Build tree recursively
        return buildNode(root, byManager);
    }

    private OrgEmployeeDTO buildNode(Employee employee, Map<String, List<Employee>> byManager) {
        OrgEmployeeDTO dto = new OrgEmployeeDTO();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setRole(employee.getRole());
        dto.setDepartment(employee.getDepartment());
        dto.setAvatarUrl(employee.getAvatarUrl());
        dto.setLocation(employee.getLocation());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setManagerId(employee.getManagerId());
        dto.setEmployeeType(employee.getEmployeeType());

        // Recursively build children
        List<Employee> children = byManager.getOrDefault(employee.getId(), new ArrayList<>());
        List<OrgEmployeeDTO> childDTOs = children.stream()
                .map(child -> buildNode(child, byManager))
                .collect(Collectors.toList());
        dto.setChildren(childDTOs);

        return dto;
    }
}
