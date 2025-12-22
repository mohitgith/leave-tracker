package com.leavetracker.model;

/**
 * Leave record entity.
 */
public class LeaveRecord {
    private String id;
    private String employeeId;
    private String startDate; // ISO Date string (yyyy-MM-dd)
    private String endDate; // ISO Date string (yyyy-MM-dd)
    private String type; // "vacation" or "sick"
    private String status; // "Applied"

    public LeaveRecord() {
    }

    public LeaveRecord(String id, String employeeId, String startDate, String endDate,
            String type, String status) {
        this.id = id;
        this.employeeId = employeeId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.type = type;
        this.status = status;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
