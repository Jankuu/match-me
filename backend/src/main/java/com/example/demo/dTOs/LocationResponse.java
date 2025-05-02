package com.example.demo.dTOs;

import lombok.Getter;
import lombok.Setter;

/*
purely for google api testing
 */
@Getter
@Setter
public class LocationResponse {
    private String message;
    public LocationResponse(String message) { this.message = message; }
}
