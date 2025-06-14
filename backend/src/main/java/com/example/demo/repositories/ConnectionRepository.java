package com.example.demo.repositories;

import com.example.demo.entities.Connection;
import com.example.demo.entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findConnectionByReceiverAndSender(UserProfile receiver, UserProfile sender);

    @Query("SELECT c FROM Connection c WHERE c.receiver = :profile OR c.sender = :profile")
    List<Connection> findByReceiverOrSender(@Param("profile") UserProfile profile);

    @Query("SELECT c FROM Connection c " +
            "WHERE (c.sender = :user1 AND c.receiver = :user2) " +
            "   OR (c.sender = :user2 AND c.receiver = :user1)")
    Optional<Connection> findConnectionBetweenUsers(@Param("user1") UserProfile user1, @Param("user2") UserProfile user2);
}
