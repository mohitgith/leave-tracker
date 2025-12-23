package com.leavetracker.service;

import com.leavetracker.model.Employee;
import com.leavetracker.model.LeaveRecord;
import com.leavetracker.model.NotificationSettings;
import com.leavetracker.repository.EmployeeRepository;
import com.leavetracker.repository.LeaveRepository;
import com.leavetracker.repository.NotificationSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Email service for sending notification emails.
 * Currently simulates email sending via console logging.
 */
@Service
public class EmailService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private NotificationSettingsRepository notificationSettingsRepository;

    private static final String MANAGER_EMAIL = "lohit.ganta@company.com";

    /**
     * Send leave summary email to all recipients.
     * If recipients list is empty, sends to manager only.
     */
    public void sendLeaveSummaryEmail() {
        NotificationSettings settings = notificationSettingsRepository.findById("default")
                .orElse(new NotificationSettings());

        if (!settings.isEnabled()) {
            System.out.println("[EMAIL SERVICE] Notifications are disabled, skipping send.");
            return;
        }

        List<String> recipients = settings.getRecipients();
        if (recipients == null || recipients.isEmpty()) {
            recipients = List.of(MANAGER_EMAIL);
        }

        String emailContent = buildEmailContent();

        // Simulate sending email (console log for demo)
        System.out.println("\n" + "=".repeat(60));
        System.out.println("[EMAIL SERVICE] Sending Leave Summary Email");
        System.out.println("=".repeat(60));
        System.out.println("TO: " + String.join(", ", recipients));
        System.out.println("SUBJECT: Daily Leave Summary - " + LocalDate.now());
        System.out.println("-".repeat(60));
        System.out.println(emailContent);
        System.out.println("=".repeat(60) + "\n");
    }

    /**
     * Build the email content with leave summary.
     */
    private String buildEmailContent() {
        List<LeaveRecord> allLeaves = leaveRepository.findAll();
        List<Employee> employees = employeeRepository.findAll();

        // Create employee lookup map
        Map<String, String> employeeNames = employees.stream()
                .collect(Collectors.toMap(Employee::getId, Employee::getName));

        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");

        StringBuilder content = new StringBuilder();
        content.append("Leave Summary for ").append(today.format(formatter)).append("\n\n");

        // Filter leaves that are active today or in the next 7 days
        LocalDate weekLater = today.plusDays(7);

        List<LeaveRecord> upcomingLeaves = allLeaves.stream()
                .filter(leave -> {
                    LocalDate startDate = LocalDate.parse(leave.getStartDate());
                    LocalDate endDate = LocalDate.parse(leave.getEndDate());
                    // Include if leave overlaps with today or upcoming week
                    return !endDate.isBefore(today) && !startDate.isAfter(weekLater);
                })
                .collect(Collectors.toList());

        if (upcomingLeaves.isEmpty()) {
            content.append("No leaves scheduled for this week.\n");
        } else {
            content.append("Upcoming/Active Leaves:\n");
            content.append("-".repeat(40)).append("\n");

            for (LeaveRecord leave : upcomingLeaves) {
                String employeeName = employeeNames.getOrDefault(leave.getEmployeeId(), "Unknown");
                LocalDate startDate = LocalDate.parse(leave.getStartDate());
                LocalDate endDate = LocalDate.parse(leave.getEndDate());

                content.append(String.format("• %s - %s\n", employeeName,
                        leave.getType().equals("vacation") ? "Annual Leave" : "Sick Leave"));
                content.append(String.format("  %s to %s\n",
                        startDate.format(formatter), endDate.format(formatter)));
                content.append("\n");
            }
        }

        content.append("\n---\nThis is an automated notification from Leave Tracker.\n");

        return content.toString();
    }
}
