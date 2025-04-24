package com.example.demo.Repositories;

import com.example.demo.Entities.Connection;
import com.example.demo.Entities.UserConnections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Page<Connection> findByUserConnectionsOrderByCreatedAtDesc(UserConnections connections, Pageable pageable);
}
