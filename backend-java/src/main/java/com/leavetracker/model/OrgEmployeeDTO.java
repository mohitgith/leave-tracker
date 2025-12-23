package com.leavetracker.model;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for org chart tree response.
 * Contains employee info plus children array for tree structure.
 */
public class OrgEmployeeDTO {
    private String id;
    private String name;
    private String role;
    private String department;
    private String location;
    private String avatarUrl;
    private String email;
    private String phone;
    private String managerId;
    private String employeeType;
    private List<OrgEmployeeDTO> children = new ArrayList<>();

    public OrgEmployeeDTO() {
    }

    /**
     * Create DTO from Employee entity.
     */
    public static OrgEmployeeDTO fromEmployee(Employee employee) {
        OrgEmployeeDTO dto = new OrgEmployeeDTO();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setRole(employee.getRole());
        dto.setDepartment(employee.getDepartment());
        dto.setLocation(employee.getLocation());
        dto.setAvatarUrl(employee.getAvatarUrl());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setManagerId(employee.getManagerId());
        dto.setEmployeeType(employee.getEmployeeType());
        dto.setChildren(new ArrayList<>());
        return dto;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public String getEmployeeType() {
        return employeeType;
    }

    public void setEmployeeType(String employeeType) {
        this.employeeType = employeeType;
    }

    public List<OrgEmployeeDTO> getChildren() {
        return children;
    }

    public void setChildren(List<OrgEmployeeDTO> children) {
        this.children = children;
    }
}
