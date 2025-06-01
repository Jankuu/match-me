package com.example.demo.restControllers;

import com.example.demo.dTOs.LocationRequest;
import com.example.demo.dTOs.LocationResponse;
import com.example.demo.entities.User;
import com.example.demo.projections.NearbyCityUserProjection;
import com.example.demo.projections.NearbyGpsUserProjection;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/location")
public class UserLocationController {
    @Autowired
    private LocationService locationService;
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userRepository.findByUsername(currentUsername).orElseThrow();
    }

    @PostMapping
    public LocationResponse setLocation(@RequestBody LocationRequest req) {
        User user = getCurrentUser();
        locationService.updateUserLocation(user, req);
        return new LocationResponse("Location updated");
    }

    @GetMapping("/nearbygps")
    public List<NearbyGpsUserProjection> getNearbyGpsUsers(
            @RequestParam Long userId,
            @RequestParam double radius // in meters
    ) {
        return locationService.findNearbyGpsUsers(userId, radius);
    }

    @GetMapping("/nearbycity")
    public List<NearbyCityUserProjection> getUsersInSameCity(
            @RequestParam Long userId
    ) {
        return locationService.findUsersInSameCity(userId);
    }


}
