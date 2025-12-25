package com.leavetracker.controller;

import com.leavetracker.model.AppNotification;
import com.leavetracker.repository.AppNotificationRepository;
import com.leavetracker.service.DataPersistenceService;
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
    private AppNotificationRepository appNotificationRepository;

    @Autowired
    private DataPersistenceService dataPersistenceService;

    /**
     * Get all notifications for a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppNotification>> getNotificationsForUser(@PathVariable String userId) {
        List<AppNotification> notifications = appNotificationRepository.findByForUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count for a user.
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = appNotificationRepository.countByForUserIdAndReadFalse(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Create a new notification.
     */
    @PostMapping
    public ResponseEntity<AppNotification> createNotification(@RequestBody AppNotification notification) {
        if (notification.getId() == null || notification.getId().isEmpty()) {
            notification.setId("notif-" + System.currentTimeMillis());
        }
        AppNotification created = appNotificationRepository.save(notification);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.ok(created);
    }

    /**
     * Mark a notification as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        return appNotificationRepository.findById(notificationId)
                .map(notification -> {
                    notification.setRead(true);
                    appNotificationRepository.save(notification);
                    dataPersistenceService.triggerImmediateSync();
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Mark all notifications as read for a user.
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@PathVariable String userId) {
        List<AppNotification> unread = appNotificationRepository
                .findByForUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        appNotificationRepository.saveAll(unread);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.ok(Map.of("markedAsRead", unread.size()));
    }
}
