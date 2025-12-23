package com.leavetracker.model;

/**
 * Unified Employee entity with hierarchy support.
 * Used for both employee list and org chart (via managerId relationship).
 */
public class Employee {
    private String id;
    private String name;
    private String role;
    private String department;
    private String avatarUrl;

    // Additional fields for org chart
    private String location;
    private String email;
    private String phone;
    private String managerId; // null for CEO/root, parent ID otherwise
    private String employeeType; // "permanent" or "contractor"

    public Employee() {
    }

    public Employee(String id, String name, String role, String department, String avatarUrl,
            String location, String email, String phone, String managerId) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.department = department;
        this.avatarUrl = avatarUrl;
        this.location = location;
        this.email = email;
        this.phone = phone;
        this.managerId = managerId;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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
}
