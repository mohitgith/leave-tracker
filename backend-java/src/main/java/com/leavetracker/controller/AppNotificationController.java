package com.leavetracker.controller;

import com.leavetracker.model.AppNotification;
import com.leavetracker.repository.JsonDatabaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for in-app notifications.
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class AppNotificationController {

    @Autowired
    private JsonDatabaseRepository repository;

    /**
     * Get all notifications for a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppNotification>> getNotificationsForUser(@PathVariable String userId) {
        List<AppNotification> notifications = repository.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count for a user.
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(@PathVariable String userId) {
        List<AppNotification> unread = repository.getUnreadNotificationsForUser(userId);
        return ResponseEntity.ok(Map.of("count", unread.size()));
    }

    /**
     * Create a new notification.
     */
    @PostMapping
    public ResponseEntity<AppNotification> createNotification(@RequestBody AppNotification notification) {
        AppNotification created = repository.createNotification(notification);
        return ResponseEntity.ok(created);
    }

    /**
     * Mark a notification as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        boolean success = repository.markNotificationAsRead(notificationId);
        if (success) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Mark all notifications as read for a user.
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@PathVariable String userId) {
        int count = repository.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok(Map.of("markedAsRead", count));
    }
}
