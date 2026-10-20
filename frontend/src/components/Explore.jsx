
import React, { useEffect, useRef, useState } from "react";
import "./Explore.css";

const API = "https://scroll-the-passion-backend.onrender.com/api/reels";

function Explore() {
  const [reels, setReels] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const videoRefs = useRef([]);
  const cardRefs = useRef([]);

  // Fetch all users' uploaded reels
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Reels load karta aalya nahit.");
        }

        const data = await response.json();
        setReels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading reels:", err);
        setError("Reels load hot nahit. Backend server check kara.");
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Play only one video at a time
  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);

    const handlePlay = (event) => {
      videos.forEach((video) => {
        if (video !== event.target) {
          video.pause();
        }
      });
    };

    videos.forEach((video) => {
      video.addEventListener("play", handlePlay);
    });

    return () => {
      videos.forEach((video) => {
        video.removeEventListener("play", handlePlay);
      });
    };
  }, [reels]);

  // Expand or collapse description
  const toggleDescription = (id) => {
    setExpandedDescriptions((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1>Explore Reels 🚀</h1>
        <p>Discover videos uploaded by our community.</p>
      </div>

      {loading && (
        <div className="explore-message">
          Loading reels...
        </div>
      )}

      {!loading && error && (
        <div className="explore-message explore-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && reels.length === 0 && (
        <div className="explore-message">
          <h3>No reels available yet 🎬</h3>
          <p>Be the first to upload a reel!</p>
        </div>
      )}

      {!loading && !error && reels.length > 0 && (
        <div className="explore-grid">
          {reels.map((reel, index) => {
            const reelId = reel.id;

            const videoUrl = reel.videoUrl
              ? reel.videoUrl.startsWith("http")
                ? reel.videoUrl
                : `https://scroll-the-passion-backend.onrender.com${
                    reel.videoUrl.startsWith("/")
                      ? reel.videoUrl
                      : `/${reel.videoUrl}`
                  }`
              : `${API}/${reelId}/video`;

            const creatorName =
              reel.fullName ||
              reel.username ||
              "Community member";

            const description =
              reel.description ||
              reel.title ||
              "Watch this reel.";

            return (
              <div
                className="explore-card"
                key={reelId}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
              >
                <div className="explore-media">
                  <video
                    ref={(element) => {
                      videoRefs.current[index] = element;
                    }}
                    className="explore-video"
                    src={videoUrl}
                    controls
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                </div>

                <div className="explore-card-content">
                  <span className="explore-tag">
                    {reel.category || "General"}
                  </span>

                  <h3>{reel.title || "Untitled Reel"}</h3>

                  <div className="explore-description">
                    {expandedDescriptions.includes(reelId) && (
                      <p>{description}</p>
                    )}

                    <button
                      type="button"
                      className="read-more-btn"
                      onClick={() => toggleDescription(reelId)}
                    >
                      {expandedDescriptions.includes(reelId)
                        ? "Show less"
                        : "Read more"}
                    </button>
                  </div>

                  <div className="explore-creator">
                    By {creatorName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Explore;
