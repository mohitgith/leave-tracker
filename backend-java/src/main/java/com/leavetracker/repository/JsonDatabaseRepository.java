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

    public synchronized Employee createEmployee(Employee employee) {
        database.getEmployees().add(employee);
        saveDatabase();
        return employee;
    }

    public synchronized Optional<Employee> updateEmployee(String id, Employee updatedEmployee) {
        List<Employee> employees = database.getEmployees();
        for (int i = 0; i < employees.size(); i++) {
            if (employees.get(i).getId().equals(id)) {
                updatedEmployee.setId(id); // Ensure ID consistency
                employees.set(i, updatedEmployee);
                saveDatabase();
                return Optional.of(updatedEmployee);
            }
        }
        return Optional.empty();
    }

    public synchronized boolean deleteEmployee(String id) {
        boolean removed = database.getEmployees().removeIf(e -> e.getId().equals(id));
        if (removed) {
            saveDatabase();
        }
        return removed;
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

    public synchronized Optional<LeaveRecord> updateLeave(String id, LeaveRecord updatedLeave) {
        List<LeaveRecord> leaves = database.getLeaves();
        for (int i = 0; i < leaves.size(); i++) {
            if (leaves.get(i).getId().equals(id)) {
                updatedLeave.setId(id); // Ensure ID consistency
                leaves.set(i, updatedLeave);
                saveDatabase();
                return Optional.of(updatedLeave);
            }
        }
        return Optional.empty();
    }

    public synchronized boolean deleteLeave(String id) {
        boolean removed = database.getLeaves().removeIf(l -> l.getId().equals(id));
        if (removed) {
            saveDatabase();
        }
        return removed;
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

        // Create employees with hierarchy - Lohit Ganta as manager (root)
        List<Employee> employees = new ArrayList<>();

        // Manager (root) - Lohit Ganta
        employees.add(new Employee("0", "Lohit Ganta", "MANAGER", "ENABLEMENT R&C",
                getAvatarUrl("Lohit Ganta"), "Office",
                "lohit.ganta@company.com", "+1 (555) 000-0000", null));

        // Team members report to Lohit
        employees.add(new Employee("1", "Aditya Pathak", "SOFTWARE DEVELOPER", "ENABLEMENT R&C",
                getAvatarUrl("Aditya Pathak"), "Office",
                "aditya.pathak@company.com", "+1 (555) 100-0001", "0"));

        employees.add(new Employee("2", "Atul Tewathia", "SOFTWARE DEVELOPER", "ENABLEMENT R&C",
                getAvatarUrl("Atul Tewathia"), "Office",
                "atul.tewathia@company.com", "+1 (555) 100-0002", "0"));

        employees.add(new Employee("3", "Bertrand Iwunna", "SOFTWARE DEVELOPER", "ENABLEMENT R&C",
                getAvatarUrl("Bertrand Iwunna"), "Office",
                "bertrand.iwunna@company.com", "+1 (555) 100-0003", "0"));

        employees.add(new Employee("4", "Carrick Mak", "DATA RISK AND CONTROLS MANAGEMENT", "ENABLEMENT R&C",
                getAvatarUrl("Carrick Mak"), "Office",
                "carrick.mak@company.com", "+1 (555) 100-0004", "0"));

        employees.add(new Employee("5", "Chris C Lee", "CONSULTANT SPECIALIST", "ENABLEMENT R&C",
                getAvatarUrl("Chris C Lee"), "Office",
                "chris.lee@company.com", "+1 (555) 100-0005", "0"));

        employees.add(new Employee("6", "Dhanashree Vishwasrao", "ASSOCIATE PROJECT MANAGER - IT SEC ANALYST",
                "ENABLEMENT R&C",
                getAvatarUrl("Dhanashree Vishwasrao"), "Office",
                "dhanashree.v@company.com", "+1 (555) 100-0006", "0"));

        employees.add(new Employee("7", "Eric Luo", "DEVELOPMENT ENGINEERING", "ENABLEMENT R&C",
                getAvatarUrl("Eric Luo"), "Office",
                "eric.luo@company.com", "+1 (555) 100-0007", "0"));

        employees.add(new Employee("8", "Gavin Guan", "SERVICE MANAGEMENT", "ENABLEMENT R&C",
                getAvatarUrl("Gavin Guan"), "Office",
                "gavin.guan@company.com", "+1 (555) 100-0008", "0"));

        employees.add(new Employee("9", "Jacky Hu", "SERVICE MANAGEMENT", "ENABLEMENT R&C",
                getAvatarUrl("Jacky Hu"), "Office",
                "jacky.hu@company.com", "+1 (555) 100-0009", "0"));

        employees.add(new Employee("10", "Mohit Shrivastava", "CONSULTANT SPECIALIST", "ENABLEMENT R&C",
                getAvatarUrl("Mohit Shrivastava"), "Office",
                "mohit.shrivastava@company.com", "+1 (555) 100-0010", "0"));

        employees.add(new Employee("11", "Sameer Kumar Sahu", "SENIOR CONSULTANT SPECIALIST", "ENABLEMENT R&C",
                getAvatarUrl("Sameer Kumar Sahu"), "Office",
                "sameer.sahu@company.com", "+1 (555) 100-0011", "0"));

        employees.add(new Employee("12", "Sreelakshmi Vineetha Movva", "TRAINEE SOFTWARE ENGINEER", "ENABLEMENT R&C",
                getAvatarUrl("Sreelakshmi Vineetha Movva"), "Office",
                "sreelakshmi.movva@company.com", "+1 (555) 100-0012", "0"));

        db.setEmployees(employees);

        // Create leave records matching the mockData employee IDs
        List<LeaveRecord> leaves = new ArrayList<>();
        leaves.add(new LeaveRecord("leave-1", "1", "2025-12-16", "2025-12-20", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-2", "3", "2025-12-23", "2025-12-31", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-3", "5", "2025-12-09", "2025-12-13", "sick", "Applied"));
        leaves.add(new LeaveRecord("leave-4", "7", "2025-12-02", "2025-12-06", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-5", "2", "2026-01-06", "2026-01-10", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-6", "4", "2026-01-13", "2026-01-17", "sick", "Applied"));
        leaves.add(new LeaveRecord("leave-7", "6", "2026-01-20", "2026-01-31", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-8", "8", "2026-01-27", "2026-01-31", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-9", "9", "2026-02-02", "2026-02-06", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-10", "10", "2026-02-09", "2026-02-13", "sick", "Applied"));
        leaves.add(new LeaveRecord("leave-11", "11", "2026-02-16", "2026-02-20", "vacation", "Applied"));
        leaves.add(new LeaveRecord("leave-12", "12", "2026-02-23", "2026-02-27", "vacation", "Applied"));

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
