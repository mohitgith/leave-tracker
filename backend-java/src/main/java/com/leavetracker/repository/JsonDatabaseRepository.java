package com.leavetracker.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.leavetracker.model.Database;
import com.leavetracker.model.Employee;
import com.leavetracker.model.LeaveRecord;
import com.leavetracker.model.OrgEmployeeDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * JSON file-based repository for persistence.
 * Data persists across server restarts.
 */
@Repository
public class JsonDatabaseRepository {

    @Value("${app.database.path:data/db.json}")
    private String databasePath;

    private final ObjectMapper objectMapper;
    private Database database;

    public JsonDatabaseRepository() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @PostConstruct
    public void init() {
        loadDatabase();
    }

    /**
     * Load database from file, or create with initial data if not exists.
     */
    private synchronized void loadDatabase() {
        File dbFile = new File(databasePath);

        if (dbFile.exists()) {
            try {
                database = objectMapper.readValue(dbFile, Database.class);
                System.out.println("Database loaded from " + databasePath);
            } catch (IOException e) {
                System.err.println("Error loading database: " + e.getMessage());
                database = createInitialDatabase();
                saveDatabase();
            }
        } else {
            System.out.println("Database file not found, creating initial data...");
            database = createInitialDatabase();
            saveDatabase();
        }
    }

    /**
     * Save database to file.
     */
    private synchronized void saveDatabase() {
        try {
            File dbFile = new File(databasePath);
            dbFile.getParentFile().mkdirs();
            objectMapper.writeValue(dbFile, database);
        } catch (IOException e) {
            System.err.println("Error saving database: " + e.getMessage());
        }
    }

    // ==================== Employee Operations ====================

    public synchronized List<Employee> getAllEmployees() {
        return new ArrayList<>(database.getEmployees());
    }

    public synchronized Optional<Employee> getEmployeeById(String id) {
        return database.getEmployees().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst();
    }

    // ==================== Leave Operations ====================

    public synchronized List<LeaveRecord> getAllLeaves() {
        return new ArrayList<>(database.getLeaves());
    }

    public synchronized LeaveRecord createLeave(LeaveRecord leave) {
        database.getLeaves().add(leave);
        saveDatabase();
        return leave;
    }

    // ==================== Org Chart Operations ====================

    /**
     * Build org chart tree from flat employee list using managerId relationships.
     */
    public synchronized OrgEmployeeDTO getOrgChart() {
        List<Employee> employees = database.getEmployees();

        // Find root (employee with null managerId)
        Employee root = employees.stream()
                .filter(e -> e.getManagerId() == null)
                .findFirst()
                .orElse(null);

        if (root == null && !employees.isEmpty()) {
            // If no explicit root, use the first employee
            root = employees.get(0);
        }

        if (root == null) {
            return null;
        }

        // Build tree recursively
        return buildOrgTree(root, employees);
    }

    private OrgEmployeeDTO buildOrgTree(Employee employee, List<Employee> allEmployees) {
        OrgEmployeeDTO dto = OrgEmployeeDTO.fromEmployee(employee);

        // Find direct reports (employees whose managerId matches this employee's id)
        List<OrgEmployeeDTO> children = allEmployees.stream()
                .filter(e -> employee.getId().equals(e.getManagerId()))
                .map(e -> buildOrgTree(e, allEmployees))
                .collect(Collectors.toList());

        dto.setChildren(children);
        return dto;
    }

    // ==================== Initial Data ====================

    private Database createInitialDatabase() {
        Database db = new Database();

        // Create employees with hierarchy
        List<Employee> employees = new ArrayList<>();

        // CEO (root)
        employees.add(new Employee("1", "Mark Bohlers", "Founder and CEO", "Executive",
                getAvatarUrl("Mark Bohlers"), "Steller Foods Headquarters",
                "mark.bohlers@stellerfoods.com", "+1 (555) 123-4567", null));

        // VP of Sales reports to CEO
        employees.add(new Employee("2", "Michelle Fillet", "VP of Sales", "Sales",
                getAvatarUrl("Michelle Fillet"), "Steller Foods Headquarters",
                "michelle.fillet@stellerfoods.com", "+1 (555) 234-5678", "1"));

        // Sales team reports to VP of Sales
        employees.add(new Employee("3", "Brandon Septimus", "Sales Manager", "Sales",
                getAvatarUrl("Brandon Septimus"), "Steller Foods Headquarters",
                "brandon.s@stellerfoods.com", "+1 (555) 345-6789", "2"));

        employees.add(new Employee("4", "Cristofer Curtis", "Associate Director of Sales", "Sales",
                getAvatarUrl("Cristofer Curtis"), "Steller Foods Headquarters",
                "cris.curtis@stellerfoods.com", "+1 (555) 456-7890", "2"));

        employees.add(new Employee("5", "Jocelyn Lubin", "Associate Director of Sales", "Sales",
                getAvatarUrl("Jocelyn Lubin"), "Steller Foods Headquarters",
                "j.lubin@stellerfoods.com", "+1 (555) 567-8901", "2"));

        employees.add(new Employee("6", "Talan Passaquindici", "Senior Director of Sales", "Sales",
                getAvatarUrl("Talan Passaquindici"), "Steller Foods Headquarters",
                "talan.p@stellerfoods.com", "+1 (555) 678-9012", "2"));

        employees.add(new Employee("7", "Ashlynn Calzoni", "Sales and Marketing Manager", "Marketing",
                getAvatarUrl("Ashlynn Calzoni"), "Steller Foods Headquarters",
                "ashlynn.c@stellerfoods.com", "+1 (555) 890-1234", "2"));

        employees.add(new Employee("8", "Angel Vetrovs", "Sales and Marketing Manager", "Marketing",
                getAvatarUrl("Angel Vetrovs"), "Steller Foods Headquarters",
                "angel.v@stellerfoods.com", "+1 (555) 901-2345", "2"));

        // Kaylynn reports to Talan
        employees.add(new Employee("9", "Kaylynn Geidt", "NW Regional Sales Architect", "Sales",
                getAvatarUrl("Kaylynn Geidt"), "Steller Foods Headquarters",
                "k.geidt@stellerfoods.com", "+1 (555) 789-0123", "6"));

        // Additional employees from original mockData
        employees.add(new Employee("10", "Aditya Pathak", "Java Developer", "Engineering",
                getAvatarUrl("Aditya Pathak"), "Steller Foods Headquarters",
                "aditya.pathak@stellerfoods.com", "+1 (555) 100-0001", "1"));

        employees.add(new Employee("11", "Lev Levko", "System Administrator", "IT",
                getAvatarUrl("Lev Levko"), "Steller Foods Headquarters",
                "lev.levko@stellerfoods.com", "+1 (555) 100-0002", "1"));

        employees.add(new Employee("12", "Antonina Lysenko", "HR Manager", "HR",
                getAvatarUrl("Antonina Lysenko"), "Steller Foods Headquarters",
                "antonina.lysenko@stellerfoods.com", "+1 (555) 100-0003", "1"));

        employees.add(new Employee("13", "Fedir Dudko", "CFO", "Finance",
                getAvatarUrl("Fedir Dudko"), "Steller Foods Headquarters",
                "fedir.dudko@stellerfoods.com", "+1 (555) 100-0004", "1"));

        employees.add(new Employee("14", "Margaryta Voloshyna", "Accountant", "Finance",
                getAvatarUrl("Margaryta Voloshyna"), "Steller Foods Headquarters",
                "margaryta.v@stellerfoods.com", "+1 (555) 100-0005", "13"));

        employees.add(new Employee("15", "Oleh Herasymets", "Accountant", "Finance",
                getAvatarUrl("Oleh Herasymets"), "Steller Foods Headquarters",
                "oleh.h@stellerfoods.com", "+1 (555) 100-0006", "13"));

        db.setEmployees(employees);

        // Create leave records
        List<LeaveRecord> leaves = new ArrayList<>();
        leaves.add(new LeaveRecord("leave-1", "10", "2025-12-16", "2025-12-20", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-2", "12", "2025-12-23", "2025-12-31", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-3", "5", "2025-12-09", "2025-12-13", "sick", "Applied"));
        leaves.add(new LeaveRecord("leave-4", "7", "2025-12-02", "2025-12-06", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-5", "11", "2026-01-06", "2026-01-10", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-6", "4", "2026-01-13", "2026-01-17", "sick", "Applied"));
        leaves.add(new LeaveRecord("leave-7", "8", "2026-01-20", "2026-01-31", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-8", "3", "2026-01-27", "2026-01-31", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-9", "9", "2026-02-02", "2026-02-06", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-10", "13", "2026-02-09", "2026-02-13", "sick", "Applied"));
        leaves.add(new LeaveRecord("leave-11", "14", "2026-02-16", "2026-02-20", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-12", "15", "2026-02-23", "2026-02-27", "vacation", "Applied"));

        db.setLeaves(leaves);

        return db;
    }

    private String getAvatarUrl(String name) {
        String encodedName = name.replace(" ", "%20");
        String[] colors = { "0066b3", "4db6ac", "f5a623", "64b5f6", "ba68c8", "e91e63", "9c27b0", "673ab7" };
        int colorIndex = name.length() % colors.length;
        return String.format("https://ui-avatars.com/api/?name=%s&background=%s&color=fff&size=64&bold=true",
                encodedName, colors[colorIndex]);
    }
}
