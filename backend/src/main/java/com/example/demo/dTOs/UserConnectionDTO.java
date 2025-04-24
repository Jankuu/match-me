package com.example.demo.dTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserConnectionDTO {
    private long senderID;
    private String senderUsername;
    private String senderEmail;

    private long receiverID;
    private String receiverUsername;
    private String receiverEmail;
}