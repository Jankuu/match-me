package com.example.demo.repositories;

import com.example.demo.entities.Connection;
import com.example.demo.entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findRequestByReceiverAndSender(UserProfile receiver, UserProfile sender);
}
