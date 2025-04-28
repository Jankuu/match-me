package com.example.demo.services;

import com.example.demo.dTOs.UserDTO;
import com.example.demo.dTOs.UserInterestVectorDTO;
import com.example.demo.dTOs.UserProfileDTO;
import com.example.demo.dTOs.UserRegistrationDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.User;
import com.example.demo.entities.UserInterestVector;
import com.example.demo.entities.UserProfile;
import com.example.demo.exceptions.DuplicateResourceException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final ConnectionsService connectionsService;

    public UserService(UserRepository userRepository, ConnectionRepository connectionRepository, @Lazy ConnectionsService connectionsService) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
        this.connectionsService = connectionsService;
    }

    // GET
    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public UserDTO getUserDTO(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);
        return new UserDTO(currentUser);
    }

    public User getUser(Long id, String username, String email) {
        if (id != null) {
            return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Could not find user by id: ", id));
        }
        if (username != null && !username.isBlank()) {
            return userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Could not find user by username: ", username));
        }
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Could not find user by email: ", email));
        }
        throw new ResourceNotFoundException("Could not find user by id, username or email: ", null);
    }

    public String getUserProfilePicture(Long id, String username, String email) {
        UserProfile userProfile = getUser(id, username, email).getProfile();
        if (userProfile.getProfilePicture() == null) {
            return null;
        }
        return Base64.getEncoder().encodeToString(userProfile.getProfilePicture());
    }

    public UserProfileDTO getUserProfileDTO(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);
        UserProfile userProfile = currentUser.getProfile();
        if (userProfile == null) {
            throw new ResourceNotFoundException("User profile not found", currentUser);
        }
        return new UserProfileDTO(userProfile);
    }

    public UserInterestVectorDTO getUserInterestsVectorDTO(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);
        UserInterestVector interestVector = currentUser.getInterestVector();
        if (interestVector == null) {
            throw new ResourceNotFoundException("User interests vector not found", currentUser);
        }
        return new UserInterestVectorDTO(interestVector);
    }

    // POST
    public UserDTO registerNewUser(UserRegistrationDTO dto) {
        if (dto.getUsername() != null && !dto.getUsername().isBlank() && userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new DuplicateResourceException("User with this username already exists", dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank() && userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateResourceException("User with this email already exists", dto.getEmail());
        }
        User newUser = assignUserValues(dto);
        if (dto.getProfile() != null) {
            newUser.setProfile(assignUserProfileValues(null, dto.getProfile()));
        } else {
            newUser.setProfile(new UserProfile());
        }
        if (dto.getInterestVector() != null) {
            newUser.setInterestVector(assignUserInterestVectorValues(null, dto.getInterestVector()));
        } else {
            newUser.setInterestVector(new UserInterestVector());
        }
        return new UserDTO(userRepository.save(newUser));
    }

    // PATCH
    public UserDTO patchUser(Long id, String username, String email, UserDTO userDTO) {
        User currentUser = getUser(id, username, email);
        currentUser = assignUserValues(currentUser, userDTO);
        if (userDTO.getProfile() != null) {
            currentUser.setProfile(assignUserProfileValues(currentUser.getProfile(), userDTO.getProfile()));
        }
        if (userDTO.getInterestVector() != null) {
            currentUser.setInterestVector(assignUserInterestVectorValues(currentUser.getInterestVector(), userDTO.getInterestVector()));
        }
        return new UserDTO(userRepository.save(currentUser));
    }

    public UserProfileDTO patchUserProfile(Long id, String username, String email, UserProfileDTO profileDTO) {
        User currentUser = getUser(id, username, email);
        if (currentUser.getProfile() == null) {
            currentUser.setProfile(new UserProfile());
        }
        currentUser.setProfile(assignUserProfileValues(currentUser.getProfile(), profileDTO));
        return new UserProfileDTO(userRepository.save(currentUser).getProfile());
    }

    public UserInterestVectorDTO patchUserInterestsVector(Long id, String username, String email, UserInterestVectorDTO userInterestVectorDTO) {
        User currentUser = getUser(id, username, email);
        if (currentUser.getInterestVector() == null) {
            currentUser.setInterestVector(new UserInterestVector(userInterestVectorDTO));
        }
        currentUser.setInterestVector(assignUserInterestVectorValues(currentUser.getInterestVector(), userInterestVectorDTO));
        return new UserInterestVectorDTO(userRepository.save(currentUser).getInterestVector());
    }

    // DELETE
    public UserDTO deleteUser(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);

        List<Connection> connections = connectionRepository.findByReceiverOrSender(currentUser.getProfile());
        connections.forEach(connectionsService::deleteConnection);

        userRepository.deleteById(currentUser.getId());
        return new UserDTO(currentUser);
    }

    public UserDTO deleteUserProfile(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);

        List<Connection> connections = connectionRepository.findByReceiverOrSender(currentUser.getProfile());
        connections.forEach(connectionsService::deleteConnection);

        currentUser.setProfile(null);
        return new UserDTO(userRepository.save(currentUser));
    }

    public UserDTO deleteUserInterestsVector(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);
        currentUser.setInterestVector(null);
        return new UserDTO(userRepository.save(currentUser));
    }

    // HELPER METHODS
    private static User assignUserValues(UserRegistrationDTO dto) {
        User user = new User();
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) user.setUsername(dto.getUsername());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) user.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) user.setPassword(dto.getPassword());
        if (dto.getInterestedMinAge() != null) user.setInterestedMinAge(dto.getInterestedMinAge());
        if (dto.getInterestedMaxAge() != null) user.setInterestedMaxAge(dto.getInterestedMaxAge());
        if (dto.getInterestedGenders() != null) user.setInterestedGenders(dto.getInterestedGenders());
        return user;
    }

    private static User assignUserValues(User user, UserDTO dto) {
        if (user == null) {
            user = new User();
        }
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) user.setUsername(dto.getUsername());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) user.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) user.setPassword(dto.getPassword());
        if (dto.getInterestedMinAge() != null) user.setInterestedMinAge(dto.getInterestedMinAge());
        if (dto.getInterestedMaxAge() != null) user.setInterestedMaxAge(dto.getInterestedMaxAge());
        if (dto.getInterestedGenders() != null) user.setInterestedGenders(dto.getInterestedGenders());
        return user;
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

        return profile;
    }

    private static UserInterestVector assignUserInterestVectorValues(UserInterestVector interestVector, UserInterestVectorDTO interestVectorDTO) {
        if (interestVector == null) {
            interestVector = new UserInterestVector();
        }
        if (interestVectorDTO.getFantasy() != null)
            interestVector.setFantasy(interestVectorDTO.getFantasy());
        if (interestVectorDTO.getCompetitive() != null)
            interestVector.setCompetitive(interestVectorDTO.getCompetitive());
        if (interestVectorDTO.getAction() != null) interestVector.setAction(interestVectorDTO.getAction());
        if (interestVectorDTO.getStory() != null) interestVector.setStory(interestVectorDTO.getStory());
        if (interestVectorDTO.getComplex() != null)
            interestVector.setComplex(interestVectorDTO.getComplex());

        return interestVector;
    }
}
