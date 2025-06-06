package com.example.demo.services;

import com.example.demo.dTOs.UserDTO;
import com.example.demo.dTOs.UserInterestVectorDTO;
import com.example.demo.dTOs.UserProfileDTO;
import com.example.demo.dTOs.UserRegistrationDTO;
import com.example.demo.entities.*;
import com.example.demo.exceptions.DuplicateResourceException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.UserRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final ConnectionsService connectionsService;
    private final PasswordEncoder passwordEncoder;
    private final LocationService locationService;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    public UserService(
            UserRepository userRepository,
            ConnectionRepository connectionRepository,
            @Lazy ConnectionsService connectionsService,
            PasswordEncoder passwordEncoder,
            LocationService locationService) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
        this.connectionsService = connectionsService;
        this.passwordEncoder = passwordEncoder;
        this.locationService = locationService;
    }

    private static UserProfile assignUserProfileValues(UserProfile profile, UserProfileDTO profileDTO) {
        if (profile == null) {
            profile = new UserProfile();
        }
        if (profileDTO.getName() != null) profile.setName(profileDTO.getName());

        if (profileDTO.getProfilePicture() != null) {
            byte[] decodedPicture = Base64.getDecoder().decode(profileDTO.getProfilePicture());
            profile.setProfilePicture(decodedPicture);
        }

        if (profileDTO.getBirthDate() != null) profile.setBirthDate(profileDTO.getBirthDate());
        if (profileDTO.getGender() != null && !profileDTO.getGender().isBlank())
            profile.setGender(profileDTO.getGender());
        if (profileDTO.getHeight() != null) profile.setHeight(profileDTO.getHeight());
        if (profileDTO.getDescription() != null)
            profile.setDescription(profileDTO.getDescription());
        if (profileDTO.getLocation() != null) profile.setLocation(profileDTO.getLocation());
        if (profileDTO.getInterestedGames() != null) profile.setInterestedGames(profileDTO.getInterestedGames());

        return profile;
    }

    private static UserInterestVector assignUserInterestVectorValues(UserInterestVector interestVector, List<Game> games) {
        if (interestVector == null) {
            interestVector = new UserInterestVector();
        }
        int total = games.size();

        int fantasySum = 0;
        int competitiveSum = 0;
        int actionSum = 0;
        int storySum = 0;
        int complexSum = 0;

        for (Game game : games) {
            fantasySum += game.getFantasy();
            competitiveSum += game.getCompetitive();
            actionSum += game.getAction();
            storySum += game.getStory();
            complexSum += game.getComplex();
        }

        interestVector.setFantasy(fantasySum / total);
        interestVector.setCompetitive(competitiveSum / total);
        interestVector.setAction(actionSum / total);
        interestVector.setStory(storySum / total);
        interestVector.setComplex(complexSum / total);

        return interestVector;
    }

    // GET
    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public UserDTO getUserDTO(String username) {
        User currentUser = getUserByUsername(username);
        return new UserDTO(currentUser);
    }

    public String getUserProfilePicture(String username) {
        UserProfile userProfile = getUserByUsername(username).getProfile();

        if (userProfile.getProfilePicture() == null) {
            return null;
        }

        return Base64.getEncoder().encodeToString(userProfile.getProfilePicture());
    }

    public UserProfileDTO getUserProfileDTO(String username) {
        User currentUser = getUserByUsername(username);
        UserProfile userProfile = currentUser.getProfile();

        if (userProfile == null) {
            throw new ResourceNotFoundException("User profile not found", currentUser);
        }

        return new UserProfileDTO(userProfile);
    }

    public UserInterestVectorDTO getUserInterestsVectorDTO(String username) {
        User currentUser = getUserByUsername(username);
        UserInterestVector interestVector = currentUser.getInterestVector();

        if (interestVector == null) {
            throw new ResourceNotFoundException("User interests vector not found", currentUser);
        }

        return new UserInterestVectorDTO(interestVector);
    }

    public List<UserProfile> getFilteredRecommendations(String username) {
        User user = getUserByUsername(username);
        if (user.getIsGpsUser()) {
            return userRepository.getFilteredRecommendations(user.getId())
                    .stream()
                    .map(User::getProfile)
                    .toList();
        } else { // TODO: recommendations for non gps users/dunno if its gonna be a separate query but leaving this here for now
            return userRepository.getFilteredRecommendations(user.getId())
                    .stream()
                    .map(User::getProfile)
                    .toList();
        }
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Could not find user by username", username));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Could not find user by email", email));
    }

    public User getUserByProfile(UserProfile profile) {
        return userRepository.findByProfile(profile).orElseThrow(() -> new ResourceNotFoundException("Could not find user by profile", profile));
    }

    public User getUserByProfileId(Long profileId) {
        return userRepository.findByProfile_Id(profileId).orElseThrow(() -> new ResourceNotFoundException("Could not find user by profile id", profileId));
    }

    // POST
    public UserDTO registerNewUser(UserRegistrationDTO registrationDTO) {
        if (registrationDTO.getUsername() == null || registrationDTO.getUsername().isBlank()) {
            registrationDTO.setUsername(generateUniqueUsername());
        }
        
        if (registrationDTO.getUsername() != null && !registrationDTO.getUsername().isBlank() && userRepository.findByUsername(registrationDTO.getUsername()).isPresent()) {
            throw new DuplicateResourceException("User with this username already exists", registrationDTO.getUsername());
        }

        if (registrationDTO.getEmail() != null && !registrationDTO.getEmail().isBlank() && userRepository.findByEmail(registrationDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("User with this email already exists", registrationDTO.getEmail());
        }

        User newUser = assignUserValues(registrationDTO);
        if (registrationDTO.getProfile() != null) {
            newUser.setProfile(assignUserProfileValues(null, registrationDTO.getProfile()));
        } else {
            newUser.setProfile(new UserProfile());
        }

        if (registrationDTO.getInterestedGames() != null && !registrationDTO.getInterestedGames().isEmpty()) {
            newUser.setInterestVector(assignUserInterestVectorValues(null, registrationDTO.getInterestedGames()));
            newUser.setInterestedGames(registrationDTO.getInterestedGames());
            newUser.getProfile().setInterestedGames(registrationDTO.getInterestedGames());
        } else {
            newUser.setInterestVector(new UserInterestVector());
        }

        return new UserDTO(userRepository.save(newUser));
    }

    // PATCH
    public UserDTO patchUser(String username, UserDTO userDTO) {
        User currentUser = getUserByUsername(username);
        currentUser = assignUserValues(currentUser, userDTO);

        if (userDTO.getProfile() != null) {
            currentUser.setProfile(assignUserProfileValues(currentUser.getProfile(), userDTO.getProfile()));
        }

        if (userDTO.getInterestedGames() != null) {
            currentUser.setInterestedGames(userDTO.getInterestedGames());

            if (currentUser.getProfile() != null) {
                currentUser.getProfile().setInterestedGames(userDTO.getInterestedGames());
            }

            if (!userDTO.getInterestedGames().isEmpty()) {
                currentUser.setInterestVector(assignUserInterestVectorValues(currentUser.getInterestVector(), userDTO.getInterestedGames()));
            }
        }

        return new UserDTO(userRepository.save(currentUser));
    }

    public UserProfileDTO patchUserProfile(String username, UserProfileDTO profileDTO) {
        User currentUser = getUserByUsername(username);
        if (currentUser.getProfile() == null) {
            currentUser.setProfile(new UserProfile());
        }
        assignUserProfileValues(currentUser.getProfile(), profileDTO);
        return new UserProfileDTO(userRepository.save(currentUser).getProfile());
    }

    // DELETE
    public UserDTO deleteUser(String username) {
        User currentUser = getUserByUsername(username);

        List<Connection> connections = connectionRepository.findByReceiverOrSender(currentUser.getProfile());
        connections.forEach(connectionsService::deleteConnection);

        userRepository.deleteById(currentUser.getId());
        return new UserDTO(currentUser);
    }

    public UserDTO deleteUserProfile(Long id, String username, String email) {
        User currentUser = getUserByUsername(username);

        List<Connection> connections = connectionRepository.findByReceiverOrSender(currentUser.getProfile());
        connections.forEach(connectionsService::deleteConnection);

        currentUser.setProfile(null);
        return new UserDTO(userRepository.save(currentUser));
    }

    public UserDTO deleteUserInterestsVector(Long id, String username, String email) {
        User currentUser = getUserByUsername(username);
        currentUser.setInterestVector(null);
        return new UserDTO(userRepository.save(currentUser));
    }

    // HELPER METHODS
    private User assignUserValues(UserRegistrationDTO dto) {
        User user = new User();
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) user.setUsername(dto.getUsername());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) user.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank())
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        if (dto.getInterestedMinAge() != null) user.setInterestedMinAge(dto.getInterestedMinAge());
        if (dto.getInterestedMaxAge() != null) user.setInterestedMaxAge(dto.getInterestedMaxAge());
        if (dto.getInterestedGenders() != null) user.setInterestedGenders(dto.getInterestedGenders());

        // Process location data
        if (dto.getCityName() != null && !dto.getCityName().isBlank()) {
            Boolean isGpsUser = dto.getIsGpsUser() != null ? dto.getIsGpsUser() : false;
            user.setIsGpsUser(isGpsUser);

            if (dto.getLat() != null && dto.getLng() != null) {
                Point point = geometryFactory.createPoint(new Coordinate(dto.getLng(), dto.getLat()));
                point.setSRID(4326);
                user.setLocation(point);
            }

            // Check if city exists and link to it, if not then add
            if (dto.getCityName() != null && !dto.getCityName().isBlank()) {
                City city = locationService.findOrAddCity(dto.getCityName(), dto.getGooglePlaceId(), dto.getLat(), dto.getLng());
                user.setCity(city);
            }
            if (isGpsUser) {
                user.setRadius(dto.getRadius());
            } else {
                user.setRadius(null);
            }
        }

        return user;
    }

    private User assignUserValues(User user, UserDTO dto) {
        if (user == null) {
            user = new User();
        }
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) user.setUsername(dto.getUsername());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) user.setEmail(dto.getEmail());
        // if (dto.getPassword() != null) user.setPassword(passwordEncoder.encode(dto.getPassword()));
        if (dto.getInterestedMinAge() != null) user.setInterestedMinAge(dto.getInterestedMinAge());
        if (dto.getInterestedMaxAge() != null) user.setInterestedMaxAge(dto.getInterestedMaxAge());
        if (dto.getInterestedGenders() != null) user.setInterestedGenders(dto.getInterestedGenders());

        // location data stuff
        if (dto.getCityName() != null && !dto.getCityName().isBlank()) {
            Boolean isGpsUser = dto.getIsGpsUser() != null ? dto.getIsGpsUser() : false;
            user.setIsGpsUser(isGpsUser);

            if (dto.getLat() != null && dto.getLng() != null) {
                Point point = geometryFactory.createPoint(new Coordinate(dto.getLng(), dto.getLat()));
                point.setSRID(4326);
                user.setLocation(point);
            }

            if (dto.getCityName() != null && !dto.getCityName().isBlank()) {
                City city = locationService.findOrAddCity(dto.getCityName(), dto.getGooglePlaceId(), dto.getLat(), dto.getLng());
                user.setCity(city);
            }

            if (isGpsUser) {
                user.setRadius(dto.getRadius());
            } else {
                user.setRadius(null);
            }
        }

        return user;
    }

    private String generateUniqueUsername() {
        String base = "user";
        String username;
        int attempt = 0;

        do {
            username = base + UUID.randomUUID().toString().substring(0, 8);
            attempt++;
        } while (userRepository.existsByUsername(username) && attempt < 10);

        if (attempt >= 10) {
            throw new RuntimeException("Failed to generate a unique username after multiple attempts");
        }

        return username;
    }
}
