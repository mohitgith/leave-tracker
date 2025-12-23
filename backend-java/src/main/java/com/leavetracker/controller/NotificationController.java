package com.leavetracker.controller;

import com.leavetracker.model.NotificationSettings;
import com.leavetracker.repository.JsonDatabaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for notification settings management.
 * GET: Available to all users (read-only view)
 * PUT: Only managers should update (enforced in frontend)
 */
@RestController
@RequestMapping("/api/notification-settings")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private JsonDatabaseRepository repository;

    /**
     * Get current notification settings.
     */
    @GetMapping
    public ResponseEntity<NotificationSettings> getNotificationSettings() {
        NotificationSettings settings = repository.getNotificationSettings();
        return ResponseEntity.ok(settings);
    }

    /**
     * Update notification settings (manager only - enforced in frontend).
     */
    @PutMapping
    public ResponseEntity<NotificationSettings> updateNotificationSettings(
            @RequestBody NotificationSettings settings) {
        NotificationSettings updated = repository.updateNotificationSettings(settings);
        return ResponseEntity.ok(updated);
    }
}
