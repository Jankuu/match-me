package com.example.demo.dTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserLinkDTO {
    private long senderId;
    private String senderUsername;
    private String senderEmail;

    private long receiverId;
    private String receiverUsername;
    private String receiverEmail;
}