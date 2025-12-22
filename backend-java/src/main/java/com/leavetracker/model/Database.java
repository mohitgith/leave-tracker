package com.leavetracker.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Container class that maps to the db.json structure.
 */
public class Database {
    private List<Employee> employees = new ArrayList<>();
    private List<LeaveRecord> leaves = new ArrayList<>();

    public Database() {
    }

    // Getters and Setters
    public List<Employee> getEmployees() {
        return employees;
    }

    public void setEmployees(List<Employee> employees) {
        this.employees = employees;
    }

    public List<LeaveRecord> getLeaves() {
        return leaves;
    }

    public void setLeaves(List<LeaveRecord> leaves) {
        this.leaves = leaves;
    }
}
