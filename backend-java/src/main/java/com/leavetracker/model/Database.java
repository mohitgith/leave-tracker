package com.leavetracker.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Container class that maps to the db.json structure.
 */
public class Database {
    private List<Employee> employees = new ArrayList<>();
    private List<LeaveRecord> leaves = new ArrayList<>();
    private NotificationSettings notificationSettings = new NotificationSettings();
    private List<AppNotification> appNotifications = new ArrayList<>();

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

    public NotificationSettings getNotificationSettings() {
        return notificationSettings;
    }

    public void setNotificationSettings(NotificationSettings notificationSettings) {
        this.notificationSettings = notificationSettings;
    }

    public List<AppNotification> getAppNotifications() {
        return appNotifications;
    }

    public void setAppNotifications(List<AppNotification> appNotifications) {
        this.appNotifications = appNotifications;
    }
}
