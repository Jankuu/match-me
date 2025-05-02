package com.example.demo.repositories;

import com.example.demo.entities.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    Optional<City> findByGooglePlaceId(String googlePlaceId);
    Optional<City> findByNameIgnoreCase(String name);

    Optional<City> findByName(String name);
}
