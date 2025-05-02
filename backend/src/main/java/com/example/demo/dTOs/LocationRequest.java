package com.example.demo.dTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationRequest {
    private Boolean gpsUser;
    private String cityName;
    private String googlePlaceId;
    private Double lat;
    private Double lng;
    private Integer radius;
}
