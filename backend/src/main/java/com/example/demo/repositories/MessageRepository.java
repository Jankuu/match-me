package com.example.demo.repositories;

import com.example.demo.entities.Message;
import com.example.demo.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    // Get all messages where the user is the receiver, newest first
    Page<Message> findAllByReceiverOrderByTimestampDesc(User receiver, Pageable pageable);

    // Get all messages where the user is the sender, newest first
    Page<Message> findAllBySenderOrderByTimestampDesc(User sender, Pageable pageable);

    // Get all messages between a sender and a receiver, newest first
    Page<Message> findAllBySenderAndReceiverOrderByTimestampDesc(User sender, User receiver, Pageable pageable);

    // Get all messages between a sender and a receiver, within a timestamp range, newest first
    @Query("SELECT m FROM Message m WHERE m.sender = :sender AND m.receiver = :receiver AND m.timestamp BETWEEN :start AND :end ORDER BY m.timestamp DESC")
    Page<Message> findBySenderAndReceiverBetweenTimestamps(
            @Param("sender") User sender,
            @Param("receiver") User receiver,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );
}
