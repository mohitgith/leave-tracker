package com.leavetracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Web app notification for in-app notification system.
 */
@Entity
@Table(name = "app_notifications")
public class AppNotification {
    @Id
    private String id;

    private String type; // "leave_applied", "leave_approved", etc.
    private String title;

    @Column(length = 1000)
    private String message;

    @Column(nullable = false)
    private String forUserId; // User ID this notification is for

    private String fromUserId; // User who triggered the notification
    private String leaveId; // Optional: related leave ID
    private String createdAt;

    @Column(name = "is_read")
    private boolean read;

    public AppNotification() {
        this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        this.read = false;
    }

    public AppNotification(String id, String type, String title, String message,
            String forUserId, String fromUserId, String leaveId) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.forUserId = forUserId;
        this.fromUserId = fromUserId;
        this.leaveId = leaveId;
        this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        this.read = false;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getForUserId() {
        return forUserId;
    }

    public void setForUserId(String forUserId) {
        this.forUserId = forUserId;
    }

    public String getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(String fromUserId) {
        this.fromUserId = fromUserId;
    }

    public String getLeaveId() {
        return leaveId;
    }

    public void setLeaveId(String leaveId) {
        this.leaveId = leaveId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}
