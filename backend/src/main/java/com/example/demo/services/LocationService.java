package com.example.demo.services;

import com.example.demo.dTOs.LocationRequest;
import com.example.demo.entities.City;
import com.example.demo.entities.User;
import com.example.demo.projections.NearbyCityUserProjection;
import com.example.demo.projections.NearbyGpsUserProjection;
import com.example.demo.repositories.CityRepository;
import com.example.demo.repositories.UserRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocationService {
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory();


    public LocationService(UserRepository userRepository, CityRepository cityRepository) {
        this.userRepository = userRepository;
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
            Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
            point.setSRID(4326);
            city.setLocation(point);
        }
        return cityRepository.save(city);
    }

    public void updateUserLocation(User user, LocationRequest req) {
        if (Boolean.TRUE.equals(req.getGpsUser())) {
            //gps user: store location and radius
            if (req.getLat() != null && req.getLng() != null) {
                Point point = geometryFactory.createPoint(new Coordinate(req.getLat(), req.getLng()));
                point.setSRID(4326);
                user.setLocation(point);
            }
            user.setRadius(req.getRadius());
            user.setIsGpsUser(true);

            // link to city IF detected via reverse geocode
            if (req.getCityName() != null && !req.getCityName().isEmpty()) {
                City city = findOrAddCity(req.getCityName(), req.getGooglePlaceId(), req.getLat(), req.getLng());
                user.setCity(city);
            } else {
                user.setCity(null);
            }
        } else { // for city list users
            City city = findOrAddCity(req.getCityName(), req.getGooglePlaceId(), req.getLat(), req.getLng());
            user.setCity(city);
            user.setLocation(null);
            user.setRadius(null);
            user.setIsGpsUser(false);
        }
        userRepository.save(user);
    }

    public List<NearbyGpsUserProjection> findNearbyGpsUsers (long userId, double radiusInMeters) {
        return userRepository.findNearbyGpsUsers(userId, radiusInMeters);
    }

    public List<NearbyCityUserProjection> findUsersInSameCity(Long refUserId) {
        return userRepository.findUsersInSameCity(refUserId);
    }

}
