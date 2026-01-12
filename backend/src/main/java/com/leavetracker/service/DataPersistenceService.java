package com.leavetracker.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.leavetracker.model.*;
import com.leavetracker.repository.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for persisting H2 database data to flat files
 * and loading data from flat files on startup.
 */
@Service
@EnableScheduling
public class DataPersistenceService {

    private static final Logger logger = LoggerFactory.getLogger(DataPersistenceService.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private NotificationSettingsRepository notificationSettingsRepository;

    @Autowired
    private AppNotificationRepository appNotificationRepository;

    @Value("${data.persistence.directory:data/persistence}")
    private String persistenceDirectory;

    @Value("${data.persistence.auto-sync:true}")
    private boolean autoSyncEnabled;

    private final ObjectMapper objectMapper;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    public DataPersistenceService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper.copy();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        // Ensure format is ISO-8601 string for dates
        this.objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    @PostConstruct
    public void init() {
        try {
            // Create persistence directory if it doesn't exist
            Path dirPath = Paths.get(persistenceDirectory);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
                logger.info("Created persistence directory: {}", persistenceDirectory);
            }

            // Load data from flat files on startup
            loadDataFromFiles();
        } catch (IOException e) {
            logger.error("Failed to initialize persistence directory", e);
        }
    }

    /**
     * Load data from flat files into H2 database on startup
     */
    private void loadDataFromFiles() {
        logger.info("Loading data from flat files...");

        try {
            // Load employees
            File employeesFile = new File(persistenceDirectory, "employees.json");
            if (employeesFile.exists()) {
                List<Employee> employees = objectMapper.readValue(employeesFile,
                        new TypeReference<List<Employee>>() {
                        });

                // Ensure passwords and usernames are set
                for (Employee emp : employees) {
                    ensureCredentials(emp);
                }

                employeeRepository.saveAll(employees);
                logger.info("Loaded {} employees from flat file", employees.size());
            } else {
                // Seed with sample data if no file exists
                seedSampleData();
            }

            // Load leave records
            File leavesFile = new File(persistenceDirectory, "leaves.json");
            if (leavesFile.exists()) {
                List<LeaveRecord> leaves = objectMapper.readValue(leavesFile,
                        new TypeReference<List<LeaveRecord>>() {
                        });
                leaveRepository.saveAll(leaves);
                logger.info("Loaded {} leave records from flat file", leaves.size());
            }

            // Load notification settings
            File settingsFile = new File(persistenceDirectory, "notification_settings.json");
            if (settingsFile.exists()) {
                NotificationSettings settings = objectMapper.readValue(settingsFile, NotificationSettings.class);
                notificationSettingsRepository.save(settings);
                logger.info("Loaded notification settings from flat file");
            } else {
                // Create default settings
                notificationSettingsRepository.save(new NotificationSettings());
            }

            // Load app notifications
            File notificationsFile = new File(persistenceDirectory, "app_notifications.json");
            if (notificationsFile.exists()) {
                List<AppNotification> notifications = objectMapper.readValue(notificationsFile,
                        new TypeReference<List<AppNotification>>() {
                        });
                appNotificationRepository.saveAll(notifications);
                logger.info("Loaded {} app notifications from flat file", notifications.size());
            }

        } catch (IOException e) {
            logger.error("Failed to load data from flat files", e);
        }
    }

    private void ensureCredentials(Employee emp) {
        if (emp.getUsername() == null || emp.getUsername().isEmpty()) {
            emp.setUsername(generateUsername(emp.getName()));
        }
        if (emp.getPassword() == null || !emp.getPassword().startsWith("$2a$")) {
            emp.setPassword(passwordEncoder.encode("password123"));
        }
    }

    private String generateUsername(String name) {
        if (name == null)
            return "user" + System.currentTimeMillis();
        String[] parts = name.toLowerCase().split(" ");
        if (parts.length >= 2) {
            return parts[0] + parts[parts.length - 1].charAt(0);
        }
        return parts[0];
    }

    /**
     * Seed sample data when no flat files exist (first run)
     */
    private void seedSampleData() {
        logger.info("Seeding sample data for first run...");

        List<Employee> employees = new ArrayList<>();

        // Manager
        Employee manager = new Employee();
        manager.setId("0");
        manager.setName("Lohit Ganta");
        manager.setRole("MANAGER");
        manager.setDepartment("ENABLEMENT R&C");
        manager.setAvatarUrl(
                "https://ui-avatars.com/api/?name=Lohit%20Ganta&background=64b5f6&color=fff&size=64&bold=true");
        manager.setLocation("Office");
        manager.setEmail("lohit.ganta@company.com");
        manager.setPhone("+1 (555) 000-0000");
        manager.setManagerId(null);
        manager.setEmployeeType("permanent");
        ensureCredentials(manager); // Add creds
        employees.add(manager);

        // Sample employees
        String[] names = { "Aditya Pathak", "Atul Tewathia", "Chris Lee", "Dhanashree Vishwanathan",
                "Eric Luo", "Gavin Guan", "Jimmy Lau", "Manish Badola", "Minju Kim" };
        String[] colors = { "e91e63", "e91e63", "ff9800", "ff9800", "64b5f6", "ff9800",
                "64b5f6", "673ab7", "e91e63" };
        String[] types = { "contractor", "contractor", "contractor", "permanent", "permanent",
                "permanent", "permanent", "contractor", "contractor" };
        String[] roles = { "SOFTWARE DEVELOPER", "SOFTWARE DEVELOPER", "CONSULTANT SPECIALIST",
                "ASSOCIATE PROJECT MANAGER", "DEVELOPMENT ENGINEER", "SERVICE MANAGEMENT",
                "PROJECT COORDINATOR", "TECHNICAL LEAD", "DATA ANALYST" };

        for (int i = 0; i < names.length; i++) {
            Employee emp = new Employee();
            emp.setId(String.valueOf(i + 1));
            emp.setName(names[i]);
            emp.setRole(roles[i]);
            emp.setDepartment("ENABLEMENT R&C");
            emp.setAvatarUrl("https://ui-avatars.com/api/?name=" + names[i].replace(" ", "%20") +
                    "&background=" + colors[i] + "&color=fff&size=64&bold=true");
            emp.setLocation("Office");
            emp.setEmail(names[i].toLowerCase().replace(" ", ".") + "@company.com");
            emp.setPhone("+1 (555) 100-000" + (i + 1));
            emp.setManagerId("0");
            emp.setEmployeeType(types[i]);
            ensureCredentials(emp); // Add creds
            employees.add(emp);
        }

        employeeRepository.saveAll(employees);
        logger.info("Seeded {} sample employees", employees.size());

        // Create default notification settings
        notificationSettingsRepository.save(new NotificationSettings());

        // Sync to files immediately
        syncDataToFiles();
    }

    /**
     * Scheduled sync - runs every 30 seconds
     */
    @Scheduled(fixedRateString = "${data.persistence.sync-interval:30}000")
    public void scheduledSync() {
        if (autoSyncEnabled) {
            syncDataToFiles();
        }
    }

    /**
     * Manual sync trigger - can be called from controllers
     */
    public synchronized void syncDataToFiles() {
        logger.debug("Syncing data to flat files...");

        try {
            // Sync employees
            List<Employee> employees = employeeRepository.findAll();
            objectMapper.writeValue(new File(persistenceDirectory, "employees.json"), employees);

            // Sync leave records
            List<LeaveRecord> leaves = leaveRepository.findAll();
            objectMapper.writeValue(new File(persistenceDirectory, "leaves.json"), leaves);

            // Sync notification settings
            notificationSettingsRepository.findById("default").ifPresent(settings -> {
                try {
                    objectMapper.writeValue(new File(persistenceDirectory, "notification_settings.json"), settings);
                } catch (IOException e) {
                    logger.error("Failed to sync notification settings", e);
                }
            });

            // Sync app notifications
            List<AppNotification> notifications = appNotificationRepository.findAll();
            objectMapper.writeValue(new File(persistenceDirectory, "app_notifications.json"), notifications);

            logger.debug("Data sync complete");

        } catch (IOException e) {
            logger.error("Failed to sync data to flat files", e);
        }
    }

    /**
     * Force immediate sync after data changes
     */
    public void triggerImmediateSync() {
        syncDataToFiles();
    }
}
