package com.example.demo.utilities;

import com.example.demo.entities.City;
import com.example.demo.entities.User;
import com.example.demo.entities.UserInterestVector;
import com.example.demo.entities.UserProfile;
import com.example.demo.repositories.CityRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
@Component
@RequiredArgsConstructor
public class UserLocationDataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CityRepository cityRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        City tallinn = ensureCity("Tallinn", 59.4370, 24.7536); // approximate central coordinates
        City tartu = ensureCity("Tartu", 58.3776, 26.7290);

        List<User> users = new ArrayList<>();

        // Generate GPS users in Tallinn
        users.addAll(generateGpsUsersInCity(5, tallinn));

        // Generate GPS users in Tartu
        users.addAll(generateGpsUsersInCity(5, tartu));

        // Generate city-based users in Tallinn
        users.addAll(generateCityUsers(5, tallinn));

        // Generate city-based users in Tartu
        users.addAll(generateCityUsers(5, tartu));

        // Generate GPS users outside any city
        users.addAll(generateGpsUsersOutsideCities(3));


        userRepository.saveAll(users);
    }

    private City ensureCity(String name, double lat, double lon) {
        return cityRepository.findByName(name).orElseGet(() -> {
            City city = new City();
            city.setName(name);
            city.setLocation(GeometryUtils.createPoint(lon, lat));
            return cityRepository.save(city);
        });
    }

    private List<User> generateGpsUsersInCity(int count, City city) {
        List<User> users = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            User user = createBasicUser();

            user.setIsGpsUser(true);
            user.setRadius(generateRandomInt(500, 3000));
            user.setCity(city); // frontend would assign this if within city bounds

            double latOffset = generateRandomDouble(-0.01, 0.01);
            double lonOffset = generateRandomDouble(-0.01, 0.01);
            double lat = city.getLocation().getY() + latOffset;
            double lon = city.getLocation().getX() + lonOffset;
            user.setLocation(GeometryUtils.createPoint(lon, lat));

            users.add(user);
        }
        return users;
    }

    private List<User> generateCityUsers(int count, City city) {
        List<User> users = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            User user = createBasicUser();
            user.setIsGpsUser(false);
            user.setCity(city);
            user.setLocation(null);
            user.setRadius(null);
            users.add(user);
        }
        return users;
    }

    private User createBasicUser() {
        User user = new User();
        UserProfile profile = new UserProfile();
        UserInterestVector interestVector = new UserInterestVector();

        user.setUsername(generateRandomString(5, 10));
        user.setPassword(generateRandomString(8, 16));

        profile.setName(generateRandomString(5, 15));
        profile.setBirthDate(generateRandomLocalDate());
        profile.setGender(generateRandomGender());
        profile.setHeight(generateRandomInt(150, 200));
        profile.setDescription(generateRandomString(100, 300));
        user.setProfile(profile);

        user.setInterestedMinAge(generateRandomInt(18, 30));
        user.setInterestedMaxAge(generateRandomInt(31, 45));
        user.setInterestedGenders(generateRandomGenders());

        interestVector.setFantasy(generateRandomInt(0, 100));
        interestVector.setCompetitive(generateRandomInt(0, 100));
        interestVector.setAction(generateRandomInt(0, 100));
        interestVector.setStory(generateRandomInt(0, 100));
        interestVector.setComplex(generateRandomInt(0, 100));
        user.setInterestVector(interestVector);

        return user;
    }
    private List<User> generateGpsUsersOutsideCities(int count) {
        List<User> users = new ArrayList<>();

        // Coordinates somewhere in South Estonia, far from Tartu/Tallinn
        double baseLat = 57.5;
        double baseLon = 25.0;

        for (int i = 0; i < count; i++) {
            User user = createBasicUser();
            user.setIsGpsUser(true);
            user.setRadius(generateRandomInt(500, 3000));
            user.setCity(null); // NOT in a city

            double latOffset = generateRandomDouble(-0.05, 0.05);
            double lonOffset = generateRandomDouble(-0.05, 0.05);
            double lat = baseLat + latOffset;
            double lon = baseLon + lonOffset;
            user.setLocation(GeometryUtils.createPoint(lon, lat));

            users.add(user);
        }

        return users;
    }


    private static double generateRandomDouble(double min, double max) {
        return ThreadLocalRandom.current().nextDouble(min, max);
    }

    private static String generateRandomString(int min, int max) {
        int length = generateRandomInt(min, max);
        Random RANDOM = new Random();
        String LETTERS = "abcdefghijklmnopqrstuvwxyz";

        StringBuilder sb = new StringBuilder(); // prefix for fun
        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(LETTERS.length());
            sb.append(LETTERS.charAt(index));
        }
        return sb.toString();
    }

    private static Integer generateRandomInt(int min, int max) {
        Random random = new Random();
        return min + random.nextInt(max - min + 1);
    }

    private static LocalDate generateRandomLocalDate() {
        LocalDate now = LocalDate.now();
        LocalDate start = now.minusYears(100);
        LocalDate end = now.minusYears(18);

        long daysBetween = ChronoUnit.DAYS.between(start, end);
        long randomDays = ThreadLocalRandom.current().nextLong(daysBetween + 1);

        return start.plusDays(randomDays);
    }

    private static String generateRandomGender() {
        if (generateRandomInt(0, 1) == 0) {
            return "man";
        } else {
            return "woman";
        }
    }

    private static String[] generateRandomGenders() {
        int rand = generateRandomInt(0, 2);
        if (rand == 0) {
            String[] randGenders = new String[2];
            randGenders[0] = "man";
            randGenders[1] = "woman";
            return randGenders;
        } else if (rand == 1) {
            String[] randGenders = new String[1];
            randGenders[0] = "man";
            return randGenders;
        } else {
            String[] randGenders = new String[1];
            randGenders[0] = "woman";
            return randGenders;
        }
    }
}
