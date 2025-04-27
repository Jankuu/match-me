package com.example.demo.utilities;

import com.example.demo.entities.User;
import com.example.demo.entities.UserInterestVector;
import com.example.demo.entities.UserProfile;
import com.example.demo.repositories.ConnectionRepository;
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
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        List<User> users = new ArrayList<>();

        for (int i = 0; i < 5; i++) {
            User user = new User();
            UserProfile profile = new UserProfile();
            UserInterestVector interestVector = new UserInterestVector();

            user.setUsername(generateRandomString(5, 10));
            user.setPassword(generateRandomString(8, 16));

            profile.setName(generateRandomString(5, 15));
            profile.setBirthDate(generateRandomLocalDate());
            profile.setGender(generateRandomGender());
            profile.setHeight(generateRandomInt(150, 200));
            profile.setDescription(generateRandomString(100, 255));
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

            users.add(user);
        }

        userRepository.saveAll(users);
/*
        Random rand = new Random();
        List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            UserConnections userConnections = user.getUserConnections();
            if (userConnections == null){
                user.setUserConnections(new UserConnections());
            }
            for (int j = 0; j < 5; j++) {
                User randomReceiver = allUsers.get(rand.nextInt(allUsers.size()));
                if (!randomReceiver.getId().equals(user.getId())) {
                    ConnectionRequest request = new ConnectionRequest();
                    request.setSender(user.getProfile());
                    request.setReceiver(randomReceiver.getProfile());
                    request.setCreatedAt(LocalDateTime.now().minusDays(rand.nextInt(100)));

                    userConnections.getConnectionRequests().add(request);
                }
            }

            userConnectionsRepository.save(userConnections);
        }*/
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
