
package scroll_the_passion.controller;

import scroll_the_passion.entity.User;
import scroll_the_passion.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private Long getUserId(HttpSession session) {
        Object id = session.getAttribute("userId");
        return id instanceof Long ? (Long) id : null;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpSession session) {
        Long id = getUserId(session);

        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login first"));
        }

        return userRepository.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Profile not found")));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody User request,
            HttpSession session) {

        Long id = getUserId(session);

        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login first"));
        }

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Profile not found"));
        }

        if (request.getFullName() != null)
            user.setFullName(request.getFullName());

        if (request.getBio() != null)
            user.setBio(request.getBio());

        if (request.getProfileImage() != null)
            user.setProfileImage(request.getProfileImage());

        if (request.getLocation() != null)
            user.setLocation(request.getLocation());

        if (request.getWebsite() != null)
            user.setWebsite(request.getWebsite());

        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyProfile(HttpSession session) {
        Long id = getUserId(session);

        if (id == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login first"));
        }

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Profile not found"));
        }

        userRepository.delete(user);
        session.invalidate();

        return ResponseEntity.noContent().build();
    }
}
