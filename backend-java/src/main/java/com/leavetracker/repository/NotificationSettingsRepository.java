package com.leavetracker.repository;

import com.leavetracker.model.NotificationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, String> {
    // Uses singleton pattern - always use ID "default"
}
