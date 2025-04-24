package com.example.demo.Repositories;

import com.example.demo.Entities.UserConnections;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserConnectionsRepository extends JpaRepository<UserConnections, Long> {
}
