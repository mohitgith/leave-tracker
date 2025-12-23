package com.leavetracker.controller;

import com.leavetracker.model.NotificationSettings;
import com.leavetracker.repository.NotificationSettingsRepository;
import com.leavetracker.service.DataPersistenceService;
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
    private NotificationSettingsRepository notificationSettingsRepository;

    @Autowired
    private DataPersistenceService dataPersistenceService;

    /**
     * Get current notification settings.
     */
    @GetMapping
    public ResponseEntity<NotificationSettings> getNotificationSettings() {
        NotificationSettings settings = notificationSettingsRepository.findById("default")
                .orElseGet(() -> {
                    NotificationSettings defaultSettings = new NotificationSettings();
                    return notificationSettingsRepository.save(defaultSettings);
                });
        return ResponseEntity.ok(settings);
    }

    /**
     * Update notification settings (manager only - enforced in frontend).
     */
    @PutMapping
    public ResponseEntity<NotificationSettings> updateNotificationSettings(
            @RequestBody NotificationSettings settings) {
        settings.setId("default"); // Always use default ID
        NotificationSettings updated = notificationSettingsRepository.save(settings);
        dataPersistenceService.triggerImmediateSync();
        return ResponseEntity.ok(updated);
    }
}
