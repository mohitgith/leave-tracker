package com.leavetracker.repository;

import com.leavetracker.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, String> {

    // Find notifications for a specific user, ordered by created date descending
    List<AppNotification> findByForUserIdOrderByCreatedAtDesc(String forUserId);

    // Find unread notifications for a user
    List<AppNotification> findByForUserIdAndReadFalseOrderByCreatedAtDesc(String forUserId);

    // Count unread notifications for a user
    long countByForUserIdAndReadFalse(String forUserId);
}
