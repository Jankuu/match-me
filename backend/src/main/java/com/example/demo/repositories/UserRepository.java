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

    // SAME QUERY BUT RETURN USER ENTITY
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
    List<User> findNearbyGpsUsersE(
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
    List<User> findUsersInSameCityE(
            @Param("refUserId") Long refUserId
    );

    // Match making
    @Query(value = """
            SELECT u.*,
                   ROUND(CAST(ST_Distance(u.location::geography, ref_user.location::geography) AS NUMERIC) / 1000.0, 2) AS geo_distance,
                   SQRT(POWER(uv.fantasy - ref_iv.fantasy, 2) +
                        POWER(uv.competitive - ref_iv.competitive, 2) +
                        POWER(uv.action - ref_iv.action, 2) +
                        POWER(uv.story - ref_iv.story, 2) +
                        POWER(uv.complex - ref_iv.complex, 2)) AS interest_distance
            FROM users u
            JOIN user_profiles up ON u.profile_id = up.id
            JOIN user_interest_vector uv ON u.user_interest_vector_id = uv.id
            JOIN users ref_user ON ref_user.id = :refUserId
            JOIN user_profiles ref_profile ON ref_user.profile_id = ref_profile.id
            JOIN user_interest_vector ref_iv ON ref_user.user_interest_vector_id = ref_iv.id
            WHERE ST_DWithin(u.location::geography, ref_user.location::geography, ref_user.radius)
              AND u.id != :refUserId
              AND (
                  DATE_PART('year', AGE(up.birth_date)) BETWEEN ref_user.interested_min_age AND ref_user.interested_max_age
              )
              AND up.gender = ANY(ref_user.interested_genders)
            ORDER BY interest_distance ASC
            LIMIT 10
            """, nativeQuery = true)
    List<User> getRecommendations(
            @Param("refUserId") Long refUserId//,
    );
}
