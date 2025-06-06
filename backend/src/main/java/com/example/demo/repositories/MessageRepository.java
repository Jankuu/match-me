package com.example.demo.repositories;

import com.example.demo.entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderProfileId = :profileId1 AND m.receiverProfileId = :profileId2) OR " +
            "(m.senderProfileId = :profileId2 AND m.receiverProfileId = :profileId1)")
    Page<Message> findMessagesBetweenProfiles(@Param("profileId1") Long profileId1,
                                              @Param("profileId2") Long profileId2,
                                              Pageable pageable);

    @Query("SELECT m FROM Message m WHERE " +
            "m.senderProfileId = :senderId AND m.receiverProfileId = :receiverId AND m.hasReceiverRead = false")
    List<Message> findUnreadMessagesFromSenderToReceiver(@Param("senderId") Long senderId,
                                                         @Param("receiverId") Long receiverId);
}
