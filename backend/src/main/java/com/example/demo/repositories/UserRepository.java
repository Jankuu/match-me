package com.example.demo.repositories;

import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.projections.NearbyCityUserProjection;
import com.example.demo.projections.NearbyGpsUserProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByProfile(UserProfile profile);

    // query for nearby gps users, rounded to 2 decimals
    @Query(value = """
    SELECT u.id, u.username,
           ROUND(CAST(ST_Distance(u.location::geography, ref_user.location::geography) AS NUMERIC)
           / 1000.0, 2) AS distance
    FROM users u
    JOIN users ref_user ON ref_user.id = :refUserId
    WHERE ST_DWithin(u.location::geography, ref_user.location::geography, :radius)
        AND u.id != :refUserId
    ORDER BY distance
""", nativeQuery = true)
    List<NearbyGpsUserProjection> findNearbyGpsUsers(
            @Param("refUserId") Long refUserId,
            @Param("radius") double radius
    );

    //query for all users in the same city
    @Query(value = """
        SELECT u.id, u.username, u.city_id
        FROM users u
        JOIN users ref_user ON ref_user.id = :refUserId
        WHERE u.city_id = ref_user.city_id
            AND u.id != :refUserId
""", nativeQuery = true)
    List<NearbyCityUserProjection> findUsersInSameCity(
            @Param("refUserId") Long refUserId
    );


}
