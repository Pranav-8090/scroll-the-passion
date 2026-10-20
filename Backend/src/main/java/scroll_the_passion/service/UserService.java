
package scroll_the_passion.service;

import scroll_the_passion.entity.User;
import scroll_the_passion.repository.UserRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("User not found: " + id)
                );
    }

    // Create new user
    public User createUser(User user) {
        user.setId(null);
        return userRepository.save(user);
    }

    // Update user
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);

        user.setFullName(updatedUser.getFullName());
        user.setUsername(updatedUser.getUsername());
        user.setBio(updatedUser.getBio());
        user.setProfileImage(updatedUser.getProfileImage());
        user.setLocation(updatedUser.getLocation());
        user.setWebsite(updatedUser.getWebsite());

        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("User not found: " + id)
                );

        userRepository.delete(user);
    }
}
