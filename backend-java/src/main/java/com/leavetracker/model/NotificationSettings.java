package com.leavetracker.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Notification settings for scheduled email notifications.
 * Managed by the manager, read-only for other employees.
 */
public class NotificationSettings {
    private String id;
    private List<String> recipients; // List of email addresses
    private String scheduledTime; // Time in HH:mm format
    private boolean enabled;

    public NotificationSettings() {
        this.id = "default";
        this.recipients = new ArrayList<>();
        this.scheduledTime = "09:00";
        this.enabled = true;
    }

    public NotificationSettings(String id, List<String> recipients, String scheduledTime, boolean enabled) {
        this.id = id;
        this.recipients = recipients != null ? recipients : new ArrayList<>();
        this.scheduledTime = scheduledTime;
        this.enabled = enabled;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<String> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<String> recipients) {
        this.recipients = recipients;
    }

    public String getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(String scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
