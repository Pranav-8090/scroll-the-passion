package scroll_the_passion.repository;

import scroll_the_passion.entity.Reel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReelRepository extends JpaRepository<Reel, Long> {

    List<Reel> findByUserIdOrderByUploadedAtDesc(Long userId);
}
