package com.example.demo.utilities;

import com.example.demo.entities.Game;
import com.example.demo.entities.User;
import com.example.demo.entities.UserInterestVector;
import com.example.demo.entities.UserProfile;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.GameRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final GameRepository gameRepository;
    private final PasswordEncoder passwordEncoder;

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

    private static float generateRandomFloat(float min, float max) {
        Random random = new Random();
        return min + random.nextFloat() * (max - min);
    }

    private static double generateRandomDouble(double min, double max) {
        Random random = new Random();
        return min + random.nextDouble() * (max - min);
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

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) generateRandomUsers();
        if (gameRepository.count() == 0) generateGames();
    }

    private void generateGames() {
        List<Game> games = List.of(
                new Game("Animal Crossing: New Horizons", 80, 0, 5, 15, 10),
                new Game("Assassin's Creed Odyssey", 10, 10, 85, 90, 35),
                new Game("Fez", 80, 0, 5, 5, 20),
                new Game("Fortnite: Battle Royale", 60, 95, 70, 5, 80),
                new Game("Persona 4 Golden", 45, 0, 10, 100, 15),
                new Game("Forza Horizon 5", 10, 40, 20, 10, 50),
                new Game("Hades", 100, 15, 70, 55, 75),
                new Game("Destiny 2", 90, 40, 85, 25, 60),
                new Game("Batman: Arkham Asylum", 20, 0, 90, 95, 15),
                new Game("Bayonetta 2", 85, 5, 85, 45, 30),
                new Game("Bloodborne", 90, 0, 100, 75, 85),
                new Game("Shadow of the Colossus", 95, 0, 65, 65, 20),
                new Game("Dishonored 2", 75, 0, 75, 85, 10),
                new Game("League Of Legends", 95, 100, 60, 5, 100),
                new Game("Counter Strike Global Offensive", 0, 100, 70, 0, 50),
                new Game("Final Fantasy 7 ", 100, 0, 80, 100, 20),
                new Game("Red Dead Redemption 2", 20, 0, 50, 65, 20),
                new Game("GTA 5", 10, 15, 85, 65, 25),
                new Game("God of War", 100, 5, 80, 85, 25),
                new Game("The Witcher 3: Wild Hunt", 100, 0, 75, 95, 20),
                new Game("Nier Automata", 80, 10, 80, 100, 30),
                new Game("Baldur's Gate 3", 100, 0, 50, 100, 40),
                new Game("The Elder Scrolls 5: Skyrim", 95, 5, 80, 65, 30),
                new Game("Pokemon Go", 45, 45, 15, 5, 5),
                new Game("Call of Duty 4: Modern Warfare", 10, 90, 100, 5, 30),
                new Game("Portal", 95, 5, 20, 65, 90),
                new Game("The Last of Us", 60, 0, 75, 85, 10),
                new Game("Minecraft", 70, 15, 10, 5, 10),
                new Game("The Legend of Zelda: Breath of the Wild", 100, 0, 5, 35, 10),
                new Game("Tekken 8", 80, 100, 90, 30, 100),
                new Game("Street Fighter 6", 60, 90, 85, 30, 90),
                new Game("Mortal Kombat 1", 100, 95, 100, 35, 95),
                new Game("No Man's Sky", 90, 5, 40, 15, 20),
                new Game("Octopath Traveler", 80, 0, 15, 100, 40),
                new Game("Satisfactory", 30, 0, 0, 15, 50),
                new Game("War Thunder", 10, 75, 75, 0, 95),
                new Game("Mount & Blade 2: Bannerlord", 10, 10, 70, 20, 20),
                new Game("Furi", 100, 5, 100, 50, 100),
                new Game("Sackboy", 100, 40, 5, 35, 30),
                new Game("Flatout 2", 50, 50, 80, 0, 10),
                new Game("Shadow Warrior", 90, 10, 100, 45, 50),
                new Game("Spore", 95, 0, 50, 0, 10),
                new Game("Tiny Tina's Wonderlands", 80, 0, 5, 15, 10),
                new Game("Tom Clancy's Rainbow Six Siege", 5, 80, 90, 5, 90),
                new Game("Assassin’s Creed Shadows", 40, 0, 50, 65, 30),
                new Game("Rocket League", 80, 80, 50, 0, 80),
                new Game("Elden Ring", 100, 5, 80, 95, 90),
                new Game("Fall Guys", 70, 90, 5, 5, 90),
                new Game("Overwatch", 60, 90, 50, 15, 50),
                new Game("Valorant", 80, 100, 75, 0, 50)
        );

        gameRepository.saveAll(games);
    }

    private void generateRandomUsers() {
        List<User> users = new ArrayList<>();

        for (int i = 0; i < 100; i++) {
            User user = new User();
            UserProfile profile = new UserProfile();
            UserInterestVector interestVector = new UserInterestVector();

            user.setUsername(generateRandomString(5, 10));

            //user.setPassword(generateRandomString(8, 16));

            user.setPassword(passwordEncoder.encode("pw"));

            profile.setName(generateRandomString(5, 15));
            profile.setBirthDate(generateRandomLocalDate());
            profile.setGender(generateRandomGender());
            profile.setHeight(generateRandomInt(150, 200));
            profile.setDescription(generateRandomString(100, 300));
            user.setProfile(profile);

            user.setInterestedMinAge(generateRandomInt(18, 19));
            user.setInterestedMaxAge(generateRandomInt(99, 100));
            user.setInterestedGenders(generateRandomGenders());

            interestVector.setFantasy(generateRandomInt(0, 100));
            interestVector.setCompetitive(generateRandomInt(0, 100));
            interestVector.setAction(generateRandomInt(0, 100));
            interestVector.setStory(generateRandomInt(0, 100));
            interestVector.setComplex(generateRandomInt(0, 100));
            user.setInterestVector(interestVector);

            int randGPS = generateRandomInt(0, 1);
            if (randGPS == 1) {
                user.setIsGpsUser(true);
                user.setLocation(GeometryUtils.createPoint(
                        generateRandomDouble(-1, 1),
                        generateRandomDouble(-1, 1)));
                user.setRadius(generateRandomInt(20000, 100000));
            } else {
                user.setIsGpsUser(false);
            }

            users.add(user);
        }
        users.add(getDebuggingUser());

        userRepository.saveAll(users);
    }

    private User getDebuggingUser() {
        User user = new User();
        UserProfile profile = new UserProfile();
        UserInterestVector interestVector = new UserInterestVector();

        user.setUsername("testUsername");
        user.setPassword(passwordEncoder.encode("testPassword"));
        user.setEmail("test@email.com");
        profile.setName("Test Name");
        profile.setBirthDate(generateRandomLocalDate());
        profile.setGender(generateRandomGender());
        profile.setHeight(generateRandomInt(150, 200));
        profile.setDescription(generateRandomString(100, 300));
        user.setProfile(profile);

        user.setInterestedMinAge(generateRandomInt(18, 19));
        user.setInterestedMaxAge(generateRandomInt(99, 100));
        user.setInterestedGenders(generateRandomGenders());

        interestVector.setFantasy(generateRandomInt(0, 100));
        interestVector.setCompetitive(generateRandomInt(0, 100));
        interestVector.setAction(generateRandomInt(0, 100));
        interestVector.setStory(generateRandomInt(0, 100));
        interestVector.setComplex(generateRandomInt(0, 100));
        user.setInterestVector(interestVector);

        int randGPS = generateRandomInt(0, 1);
        if (randGPS == 1) {
            user.setIsGpsUser(true);
            user.setLocation(GeometryUtils.createPoint(
                    generateRandomDouble(-1, 1),
                    generateRandomDouble(-1, 1)));
            user.setRadius(generateRandomInt(20000, 100000));
        } else {
            user.setIsGpsUser(false);
        }
        return user;
    }
}
