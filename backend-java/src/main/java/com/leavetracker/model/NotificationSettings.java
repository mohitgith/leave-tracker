package com.leavetracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import java.util.ArrayList;
import java.util.List;

/**
 * Notification settings for scheduled email notifications.
 * Managed by the manager, read-only for other employees.
 */
@Entity
@Table(name = "notification_settings")
public class NotificationSettings {
    @Id
    private String id;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_recipients", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "email")
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
