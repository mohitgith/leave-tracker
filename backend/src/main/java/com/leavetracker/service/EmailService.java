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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Email service for sending notification emails.
 * Currently simulates email sending via console logging.
 * Uses IST (Asia/Kolkata) timezone for all date operations.
 */
@Service
public class EmailService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private NotificationSettingsRepository notificationSettingsRepository;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String senderEmail;

    private static final String MANAGER_EMAIL = "lohit.ganta@company.com";
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

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

        LocalDate todayIST = LocalDate.now(IST_ZONE);
        String formattedDate = todayIST.format(DATE_FORMATTER);
        String emailContent = buildEmailContent(todayIST);
        String subject = "Leave Notification - " + formattedDate;

        // Ensure Manager is always included, plus any additional recipients
        List<String> userRecipients = settings.getRecipients();
        java.util.Set<String> finalRecipients = new java.util.HashSet<>();
        finalRecipients.add(MANAGER_EMAIL);

        if (userRecipients != null) {
            finalRecipients.addAll(userRecipients);
        }

        // Simulate sending email (console log for demo)
        System.out.println("\n" + "=".repeat(80));
        System.out.println("[EMAIL SERVICE] Sending Leave Summary Email");
        System.out.println("=".repeat(80));
        System.out.println("TO: " + String.join(", ", finalRecipients));
        System.out.println("SUBJECT: " + subject);
        System.out.println("-".repeat(80));
        System.out.println(emailContent);
        System.out.println("=".repeat(80) + "\n");

        // Send real email via SMTP
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true);

            helper.setFrom(senderEmail);
            helper.setTo(finalRecipients.toArray(new String[0]));
            helper.setSubject(subject);
            // Sending as HTML
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("[EMAIL SERVICE] Email sent successfully via SMTP.");
        } catch (jakarta.mail.MessagingException e) {
            System.err.println("[EMAIL SERVICE] Failed to send email via SMTP: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("[EMAIL SERVICE] Unexpected error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Build the email content with leave summary for today.
     * Uses IST timezone for date calculations.
     */
    private String buildEmailContent(LocalDate todayIST) {
        List<LeaveRecord> allLeaves = leaveRepository.findAll();
        List<Employee> employees = employeeRepository.findAll();

        // Create employee lookup maps
        Map<String, Employee> employeeMap = employees.stream()
                .collect(Collectors.toMap(Employee::getId, e -> e));

        String formattedDate = todayIST.format(DATE_FORMATTER);

        // Filter leaves that are active today (employee is on leave today)
        List<LeaveRecord> leavesToday = allLeaves.stream()
                .filter(leave -> {
                    LocalDate startDate = LocalDate.parse(leave.getStartDate());
                    LocalDate endDate = LocalDate.parse(leave.getEndDate());
                    // Include if today falls within the leave period
                    return !todayIST.isBefore(startDate) && !todayIST.isAfter(endDate);
                })
                .collect(Collectors.toList());

        StringBuilder content = new StringBuilder();

        // Email body - HTML
        content.append("<html><body>");
        content.append("<p>Hello Team,</p>");
        content.append(
                "<p>This is an automated notification to inform you of the employees who are on leave today.</p>");
        content.append("<p><strong>Date:</strong> ").append(formattedDate).append("</p>");

        if (leavesToday.isEmpty()) {
            content.append("<p>No employees are on leave today.</p>");
        } else {
            // Build HTML table
            content.append(
                    "<table border='1' style='border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 14px;'>");
            content.append("<tr style='background-color: #f2f2f2;'>");
            content.append("<th style='padding: 8px; text-align: left;'>Employee Name</th>");
            content.append("<th style='padding: 8px; text-align: left;'>Role</th>");
            content.append("<th style='padding: 8px; text-align: left;'>Employee Type</th>");
            content.append("<th style='padding: 8px; text-align: left;'>Type of Leave</th>");
            content.append("</tr>");

            // Build table rows
            for (LeaveRecord leave : leavesToday) {
                Employee employee = employeeMap.get(leave.getEmployeeId());
                if (employee != null) {
                    String employeeName = employee.getName();
                    String role = employee.getRole();
                    String employeeType = employee.getEmployeeType() != null ? employee.getEmployeeType() : "N/A";
                    // Capitalize first letter
                    employeeType = employeeType.substring(0, 1).toUpperCase() + employeeType.substring(1).toLowerCase();
                    String leaveType = formatLeaveType(leave.getType());

                    content.append("<tr>");
                    content.append("<td style='padding: 8px;'>").append(employeeName).append("</td>");
                    content.append("<td style='padding: 8px;'>").append(role).append("</td>");
                    content.append("<td style='padding: 8px;'>").append(employeeType).append("</td>");
                    content.append("<td style='padding: 8px;'>").append(leaveType).append("</td>");
                    content.append("</tr>");
                }
            }
            content.append("</table>");
            content.append("<br/>");
        }

        content.append(
                "<p>Please consider this information while planning daily tasks, meetings, and work dependencies.</p>");
        content.append("<p style='color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px;'>");
        content.append("This is a system-generated email. <strong>Please do not reply</strong> to this message.<br/>");
        content.append("Regards,<br/>");
        content.append("Leave Management System<br/>");
        content.append("<strong>(No-Reply | Automated Notification)</strong>");
        content.append("</p>");
        content.append("</body></html>");

        return content.toString();
    }

    /**
     * Format leave type for display.
     */
    private String formatLeaveType(String type) {
        if (type == null)
            return "Leave";
        switch (type.toLowerCase()) {
            case "vacation":
                return "Annual Leave";
            case "sick":
                return "Sick Leave";
            case "personal":
                return "Personal Leave";
            default:
                return type.substring(0, 1).toUpperCase() + type.substring(1) + " Leave";
        }
    }

}
