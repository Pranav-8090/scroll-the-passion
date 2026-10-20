package scroll_the_passion.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import scroll_the_passion.entity.User;
import scroll_the_passion.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (request == null
                || request.fullName() == null
                || request.username() == null
                || request.email() == null
                || request.password() == null
                || request.fullName().isBlank()
                || request.username().isBlank()
                || request.email().isBlank()
                || request.password().length() < 8) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "message",
                    "Enter all details. Password must be at least 8 characters."
                )
            );
        }

        String fullName = request.fullName().trim();
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Email already registered")
            );
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Username already exists")
            );
        }

        User user = new User();
        user.setFullName(fullName);
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(
            passwordEncoder.encode(request.password())
        );

        User savedUser = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
                "id", savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "username", savedUser.getUsername(),
                "email", savedUser.getEmail()
            )
        );
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {

        if (request == null
                || request.email() == null
                || request.password() == null
                || request.email().isBlank()
                || request.password().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("message", "Email and password are required")
            );
        }

        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null
                || user.getPasswordHash() == null
                || !passwordEncoder.matches(
                    request.password(),
                    user.getPasswordHash())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Invalid email or password")
            );
        }

        // Create a fresh session after successful authentication.
        HttpSession oldSession = servletRequest.getSession(false);

        if (oldSession != null) {
            oldSession.invalidate();
        }

        HttpSession newSession = servletRequest.getSession(true);
        newSession.setAttribute("userId", user.getId());

        return ResponseEntity.ok(
            Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "username", user.getUsername(),
                "email", user.getEmail()
            )
        );
    }

    // GET CURRENT LOGGED-IN USER
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Please login first")
            );
        }

        Object userId = session.getAttribute("userId");

        if (!(userId instanceof Number)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "User session not found")
            );
        }

        Integer id = ((Number) userId).intValue();

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "User not found")
            );
        }

        return ResponseEntity.ok(
            Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "username", user.getUsername(),
                "email", user.getEmail()
            )
        );
    }

    // LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(
            Map.of("message", "Logged out successfully")
        );
    }

    // REQUEST DTOs
    public record RegisterRequest(
        String fullName,
        String username,
        String email,
        String password
    ) {
    }

    public record LoginRequest(
        String email,
        String password
    ) {
    }
}