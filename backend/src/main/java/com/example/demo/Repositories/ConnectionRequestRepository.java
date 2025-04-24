package com.example.demo.Repositories;

import com.example.demo.Entities.ConnectionRequest;
import com.example.demo.Entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    Optional<ConnectionRequest> findByReceiverAndSender(UserProfile receiver, UserProfile sender);
}
