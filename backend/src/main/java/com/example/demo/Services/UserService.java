package com.example.demo.Services;

import com.example.demo.DTOs.UserDTO;
import com.example.demo.DTOs.UserInterestVectorDTO;
import com.example.demo.DTOs.UserProfileDTO;
import com.example.demo.DTOs.UserRegistrationDTO;
import com.example.demo.Entities.User;
import com.example.demo.Entities.UserInterestVector;
import com.example.demo.Entities.UserProfile;
import com.example.demo.Exeptions.DuplicateResourceException;
import com.example.demo.Exeptions.ResourceNotFoundException;
import com.example.demo.Repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET
    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
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

    public UserProfile getUserProfile(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);
        UserProfile userProfile = currentUser.getProfile();
        if (userProfile == null) {
            throw new ResourceNotFoundException("User profile not found", currentUser);
        }
        return userProfile;
    }

    public UserInterestVector getUserInterestsVector(Long id, String username, String email) {
        User currentUser = getUser(id, username, email);
        UserInterestVector interestVector = currentUser.getInterestVector();
        if (interestVector == null) {
            throw new ResourceNotFoundException("User interests vector not found", currentUser);
        }
        return interestVector;
    }

    // POST
    public User registerNewUser(UserRegistrationDTO dto) {
        if (dto.getUsername() != null && !dto.getUsername().isBlank() && userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new DuplicateResourceException("User with this username already exists", dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank() && userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateResourceException("User with this email already exists", dto.getEmail());
        }
        User newUser = assignUserValues(dto);
        if (dto.getProfile() != null) {
            newUser.setProfile(assignUserProfileValues(null, dto.getProfile()));
        }
        if (dto.getInterestVector() != null) {
            newUser.setInterestVector(assignUserInterestVectorValues(null, dto.getInterestVector()));
        }
        return userRepository.save(newUser);
    }

    // PATCH
    public User patchUser(Long id, String username, String email, UserDTO userDTO) {
        User currentUser = getUser(id, username, email);
        currentUser = assignUserValues(currentUser, userDTO);
        if (userDTO.getProfile() != null) {
            currentUser.setProfile(assignUserProfileValues(currentUser.getProfile(), userDTO.getProfile()));
        }

        if (userDTO.getInterestVector() != null) {
            currentUser.setInterestVector(assignUserInterestVectorValues(currentUser.getInterestVector(), userDTO.getInterestVector()));
        }

        return userRepository.save(currentUser);
    }

    public UserProfile patchUserProfile(Long id, String username, String email, UserProfileDTO profileDTO) {
        User currentUser = getUser(id, username, email);
        if (currentUser.getProfile() == null) {
            currentUser.setProfile(new UserProfile());
        }
        currentUser.setProfile(assignUserProfileValues(currentUser.getProfile(), profileDTO));
        return userRepository.save(currentUser).getProfile();
    }

    public UserInterestVector patchUserInterestsVector(Long id, String username, String email, UserInterestVectorDTO userInterestVectorDTO) {
        User currentUser = getUser(id, username, email);
        if (currentUser.getInterestVector() == null) {
            currentUser.setInterestVector(new UserInterestVector(userInterestVectorDTO));
        }
        currentUser.setInterestVector(assignUserInterestVectorValues(currentUser.getInterestVector(), userInterestVectorDTO));
        return userRepository.save(currentUser).getInterestVector();
    }

    // DELETE

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
        if (profileDTO.getName() != null && !profileDTO.getName().isBlank()) profile.setName(profileDTO.getName());
        if (profileDTO.getProfilePicture() != null) profile.setProfilePicture(profileDTO.getProfilePicture());
        if (profileDTO.getBirthDate() != null) profile.setBirthDate(profileDTO.getBirthDate());
        if (profileDTO.getGender() != null && !profileDTO.getGender().isBlank())
            profile.setGender(profileDTO.getGender());
        if (profileDTO.getHeight() != null) profile.setHeight(profileDTO.getHeight());
        if (profileDTO.getDescription() != null && !profileDTO.getDescription().isBlank())
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
