package com.leavetracker.service;

import com.leavetracker.model.NotificationSettings;
import com.leavetracker.repository.NotificationSettingsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ScheduledFuture;

/**
 * Scheduler that dynamically schedules notification emails.
 * Uses TaskScheduler to run tasks exactly at the configured time,
 * instead of polling.
 */
@Service
public class NotificationScheduler {

    @Autowired
    private NotificationSettingsRepository notificationSettingsRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TaskScheduler taskScheduler;

    private ScheduledFuture<?> scheduledTask;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    /**
     * Initialize scheduler on startup.
     */
    @PostConstruct
    public void init() {
        scheduleNotification();
    }

    /**
     * Schedule or reschedule the notification task based on current settings.
     */
    public synchronized void scheduleNotification() {
        // Cancel existing task if any
        if (scheduledTask != null && !scheduledTask.isCancelled()) {
            scheduledTask.cancel(false);
            System.out.println("[SCHEDULER] Cancelled previous scheduled task.");
        }

        NotificationSettings settings = notificationSettingsRepository.findById("default")
                .orElse(new NotificationSettings());

        if (!settings.isEnabled()) {
            System.out.println("[SCHEDULER] Notifications disabled. No task scheduled.");
            return;
        }

        String scheduledTimeStr = settings.getScheduledTime();
        if (scheduledTimeStr == null || scheduledTimeStr.isEmpty()) {
            System.out.println("[SCHEDULER] No scheduled time configured.");
            return;
        }

        try {
            LocalTime time = LocalTime.parse(scheduledTimeStr, TIME_FORMATTER);
            LocalDateTime now = LocalDateTime.now(IST_ZONE);
            LocalDateTime runTime = now.with(time).withSecond(0).withNano(0);

            // If time has already passed today, schedule for tomorrow
            if (now.compareTo(runTime) >= 0) {
                runTime = runTime.plusDays(1);
            }

            Instant runInstant = runTime.atZone(IST_ZONE).toInstant();

            System.out.println("[SCHEDULER] Scheduling notification for: " + runInstant + " (IST)");

            scheduledTask = taskScheduler.schedule(this::executeTask, runInstant);

        } catch (Exception e) {
            System.err.println("[SCHEDULER] Failed to schedule task: " + e.getMessage());
        }
    }

    /**
     * Execute the task and schedule the next run (for next day).
     */
    private void executeTask() {
        System.out.println("[SCHEDULER] Executing scheduled notification task...");
        try {
            emailService.sendLeaveSummaryEmail();
        } catch (Exception e) {
            System.err.println("[SCHEDULER] Error sending email: " + e.getMessage());
        } finally {
            // Schedule next run for tomorrow
            scheduleNotification();
        }
    }

    /**
     * Public method to trigger reschedule (called when settings change).
     */
    public void reschedule() {
        System.out.println("[SCHEDULER] Settings updated. Rescheduling...");
        scheduleNotification();
    }
}
