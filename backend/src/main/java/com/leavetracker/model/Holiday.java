package com.leavetracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "holidays")
public class Holiday {
    @Id
    private String id;
    private String name;
    private LocalDate date;

    // Constructors
    public Holiday() {
    }

    public Holiday(String id, String name, LocalDate date) {
        this.id = id;
        this.name = name;
        this.date = date;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
