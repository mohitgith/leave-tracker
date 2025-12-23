package com.leavetracker.service;

import com.leavetracker.model.NotificationSettings;
import com.leavetracker.repository.JsonDatabaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * Scheduler that checks every minute if it's time to send notifications.
 * Compares current time with configured scheduled time in notification
 * settings.
 */
@Service
@EnableScheduling
public class NotificationScheduler {

    @Autowired
    private JsonDatabaseRepository repository;

    @Autowired
    private EmailService emailService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Check every minute if it's time to send notifications.
     */
    @Scheduled(cron = "0 * * * * *") // Every minute at 0 seconds
    public void checkAndSendNotifications() {
        NotificationSettings settings = repository.getNotificationSettings();

        if (!settings.isEnabled()) {
            return;
        }

        String currentTime = LocalTime.now().format(TIME_FORMATTER);
        String scheduledTime = settings.getScheduledTime();

        if (currentTime.equals(scheduledTime)) {
            System.out.println("[SCHEDULER] Time matched! Triggering email notification...");
            emailService.sendLeaveSummaryEmail();
        }
    }
}
