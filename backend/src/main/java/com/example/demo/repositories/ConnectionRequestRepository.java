package com.example.demo.repositories;

import com.example.demo.entities.ConnectionRequest;
import com.example.demo.entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    Optional<ConnectionRequest> findByReceiverAndSender(UserProfile receiver, UserProfile sender);
}
