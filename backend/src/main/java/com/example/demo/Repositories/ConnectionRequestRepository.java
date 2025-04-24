package com.example.demo.Repositories;

import com.example.demo.Entities.ConnectionRequest;
import com.example.demo.Entities.UserConnections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {
    Page<ConnectionRequest> findByUserConnectionsOrderByCreatedAtDesc(UserConnections connections, Pageable pageable);
}
