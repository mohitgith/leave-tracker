package com.leavetracker.repository;

import com.leavetracker.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    // Find all employees under a manager
    List<Employee> findByManagerId(String managerId);

    // Find the root employee (manager with no parent)
    Optional<Employee> findByManagerIdIsNull();

    // Find by employee type
    List<Employee> findByEmployeeType(String employeeType);

    // Search employees by name
    List<Employee> findByNameContainingIgnoreCase(String name);

    // Find by username for authentication
    Optional<Employee> findByUsername(String username);

    // Count employees by department
    @Query("SELECT e.department, COUNT(e) FROM Employee e GROUP BY e.department")
    List<Object[]> countByDepartment();
}
