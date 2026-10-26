
package scroll_the_passion.controller;

import scroll_the_passion.entity.Reel;
import scroll_the_passion.entity.User;
import scroll_the_passion.repository.ReelRepository;
import scroll_the_passion.repository.UserRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/reels")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:3000"
    },
    allowCredentials = "true"
)
public class ReelController {

    private final ReelRepository reelRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads/reels}")
    private String uploadDirectory;

    @Value("${app.frontend.url https://scroll-the-passion-frontend.onrender.com }")
    private String frontendUrl;

    public ReelController(
            ReelRepository reelRepository,
            UserRepository userRepository) {

        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
    }

    // Get the currently logged-in user's ID
    private Long getLoggedInUserId(HttpSession session) {
        Object id = session.getAttribute("userId");

        if (id == null) {
            return null;
        }

        try {
            return Long.valueOf(id.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // Build a complete response for a reel
    private Map<String, Object> toReelResponse(Reel reel) {

        Map<String, Object> item = new LinkedHashMap<>();

        item.put("id", reel.getId());
        item.put("title", reel.getTitle());
        item.put("category", reel.getCategory());
        item.put("userId", reel.getUserId());
        item.put("uploadedAt", reel.getUploadedAt());

        item.put(
            "videoUrl",
            frontendBackendVideoUrl(reel.getId())
        );

        // Include creator details for Home and Profile
        userRepository.findById(reel.getUserId()).ifPresent(user -> {
            item.put("username", user.getUsername());
            item.put("fullName", user.getFullName());
            item.put("profileImage", user.getProfileImage());
        });

        return item;
    }

    private String frontendBackendVideoUrl(Long reelId) {
        return "https://scroll-the-passion-backend.onrender.com/api/reels/" + reelId + "/video";
    }

    // 1. Upload a reel
    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadReel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            HttpSession session) {

        Long userId = getLoggedInUserId(session);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login before uploading a reel."));
        }

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Logged-in user was not found."));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Please select a video."));
        }

        if (file.getSize() > 100L * 1024 * 1024) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Video size must be below 100 MB."));
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("video/")) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Please upload a valid video file."));
        }

        String originalName = StringUtils.cleanPath(
            Objects.requireNonNullElse(
                file.getOriginalFilename(), "video"
            )
        );

        String extension = "";
        int dot = originalName.lastIndexOf('.');

        if (dot >= 0) {
            extension = originalName.substring(dot)
                .toLowerCase(Locale.ROOT);
        }

        Set<String> allowedExtensions =
            Set.of(".mp4", ".webm", ".mov", ".m4v");

        if (!allowedExtensions.contains(extension)) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "message",
                    "Supported formats: MP4, WebM, MOV, M4V."
                ));
        }

        String savedName = UUID.randomUUID() + extension;

        Path directory = Paths.get(uploadDirectory)
            .toAbsolutePath()
            .normalize();

        Path destination = directory.resolve(savedName).normalize();

        if (!destination.startsWith(directory)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid file path."));
        }

        try {
            Files.createDirectories(directory);
            file.transferTo(destination);

            Reel reel = new Reel();
            reel.setTitle(title == null ? "" : title.trim());
            reel.setCategory(
                category == null || category.isBlank()
                    ? "For You"
                    : category.trim()
            );
            reel.setVideoFileName(savedName);

            // Link the uploaded reel to its actual owner
            reel.setUserId(userId);

            Reel savedReel = reelRepository.save(reel);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(toReelResponse(savedReel));

        } catch (IOException | RuntimeException e) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException ignored) {
                // Preserve the original error.
            }

            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Reel could not be saved."));
        }
    }

    // 2. All reels for Home / Explore
    // Everyone can view all uploaded reels
    @GetMapping
    public ResponseEntity<?> getAllReels() {

        List<Reel> allReels = reelRepository.findAll();

        allReels.sort((r1, r2) -> {
            if (r1.getUploadedAt() == null) return 1;
            if (r2.getUploadedAt() == null) return -1;

            return r2.getUploadedAt()
                .compareTo(r1.getUploadedAt());
        });

        List<Map<String, Object>> result = allReels.stream()
            .map(this::toReelResponse)
            .toList();

        return ResponseEntity.ok(result);
    }

    // 3. Logged-in user's own reels
    @GetMapping("/my")
    public ResponseEntity<?> getMyReels(HttpSession session) {

        Long userId = getLoggedInUserId(session);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login first."));
        }

        List<Map<String, Object>> result =
            reelRepository
                .findByUserIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(this::toReelResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    // 4. Reels belonging to a particular public profile
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReelsByUser(
            @PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found."));
        }

        List<Map<String, Object>> result =
            reelRepository
                .findByUserIdOrderByUploadedAtDesc(userId)
                .stream()
                .map(this::toReelResponse)
                .toList();

        return ResponseEntity.ok(result);
    }

    // 5. Delete only the logged-in user's own reel
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReel(
            @PathVariable Long id,
            HttpSession session) {

        Long userId = getLoggedInUserId(session);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please login first."));
        }

        Optional<Reel> optionalReel = reelRepository.findById(id);

        if (optionalReel.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Reel not found."));
        }

        Reel reel = optionalReel.get();

        // Never allow deleting another user's reel
        if (!userId.equals(reel.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                    "message",
                    "You can delete only your own reels."
                ));
        }

        Path directory = Paths.get(uploadDirectory)
            .toAbsolutePath()
            .normalize();

        Path videoPath = directory
            .resolve(reel.getVideoFileName())
            .normalize();

        if (!videoPath.startsWith(directory)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid video path."));
        }

        try {
            // Delete the database record first.
            // The video file can then be removed.
            reelRepository.delete(reel);

            try {
                Files.deleteIfExists(videoPath);
            } catch (IOException fileError) {
                // The reel is deleted from the database.
                // A leftover file can be cleaned up separately.
            }

            return ResponseEntity.ok(
                Map.of("message", "Reel deleted successfully.")
            );

        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Could not delete reel."));
        }
    }

    // 6. Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> testReelController() {
        return ResponseEntity.ok("ReelController is working!");
    }

    // 7. Debug endpoint
    @GetMapping("/debug/{id}")
    public ResponseEntity<?> debugReel(@PathVariable Long id) {
        return reelRepository.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 8. Stream video file
    @GetMapping("/{id}/video")
    public ResponseEntity<?> getReelVideo(@PathVariable Long id) {

        Optional<Reel> optionalReel = reelRepository.findById(id);

        if (optionalReel.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path directory = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize();

            Path videoPath = directory
                .resolve(optionalReel.get().getVideoFileName())
                .normalize();

            if (!videoPath.startsWith(directory)
                    || !Files.isRegularFile(videoPath)) {
                return ResponseEntity.notFound().build();
            }

            String filename = videoPath.getFileName()
                .toString()
                .toLowerCase(Locale.ROOT);

            MediaType mediaType;

            if (filename.endsWith(".webm")) {
                mediaType = MediaType.parseMediaType("video/webm");
            } else if (filename.endsWith(".mov")) {
                mediaType = MediaType.parseMediaType("video/quicktime");
            } else {
                mediaType = MediaType.parseMediaType("video/mp4");
            }

            return ResponseEntity.ok()
                .contentType(mediaType)
                .header("Accept-Ranges", "bytes")
                .body(Files.readAllBytes(videoPath));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Could not read video."));
        }
    }
}
