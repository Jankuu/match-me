package com.example.demo.services;

import com.example.demo.entities.City;
import com.example.demo.repositories.CityRepository;
import com.example.demo.utilities.GeometryUtils;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LocationService {
    private final CityRepository cityRepository;


    public LocationService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    public City findOrAddCity(String name, String googlePlaceId, Double lat, Double lng) {
        if (googlePlaceId != null && !googlePlaceId.isEmpty()) {
            Optional<City> cityRef = cityRepository.findByGooglePlaceId(googlePlaceId);
            if (cityRef.isPresent()) return cityRef.get();
        }
        if (name != null && !name.isEmpty()) {
            Optional<City> cityRef = cityRepository.findByNameIgnoreCase(name);
            if (cityRef.isPresent()) return cityRef.get();
        }
        City city = new City();
        city.setName(name);
        city.setGooglePlaceId(googlePlaceId);
        if (lat != null && lng != null) {
            Point point = GeometryUtils.createPoint(lat, lng);
            city.setLocation(point);
        }
        return cityRepository.save(city);
    }

}
