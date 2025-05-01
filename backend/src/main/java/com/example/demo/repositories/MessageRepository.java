package com.example.demo.repositories;

import com.example.demo.entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
            "(m.senderId = :userId2 AND m.receiverId = :userId1)")
    Page<Message> findMessagesBetweenUsers(@Param("userId1") Long userId1,
                                           @Param("userId2") Long userId2,
                                           Pageable pageable);

    @Query("SELECT m FROM Message m WHERE " +
            "((m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
            " (m.senderId = :userId2 AND m.receiverId = :userId1)) AND " +
            "LOWER(m.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Message> searchMessagesBetweenUsers(@Param("userId1") Long userId1,
                                             @Param("userId2") Long userId2,
                                             @Param("searchTerm") String searchTerm,
                                             Pageable pageable);
}
