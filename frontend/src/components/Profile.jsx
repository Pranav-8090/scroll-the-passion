
import { useCallback, useEffect, useState } from "react";
import {
  UserRound,
  MapPin,
  Globe,
  Pencil,
  Save,
  X,
  LoaderCircle,
  Camera,
  Trash2,
  Play,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import "./Profile.css";

const API = "http://localhost:8085/api/users/me";
const REELS_API = "http://localhost:8085/api/reels";

const emptyProfile = {
  fullName: "",
  username: "",
  bio: "",
  profileImage: "",
  location: "",
  website: "",
};

function getErrorMessage(data, fallback) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return data?.message || data?.error || fallback;
}

function getVideoUrl(reel) {
  const rawUrl = reel.videoUrl;

  if (!rawUrl) {
    return `${REELS_API}/${reel.id}/video`;
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  return `http://localhost:8085${
    rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`
  }`;
}

function Profile({ user }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [originalProfile, setOriginalProfile] = useState(emptyProfile);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [reelsError, setReelsError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});
  const [retryKeys, setRetryKeys] = useState({});

  // Load profile details.
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          getErrorMessage(
            data,
            response.status === 401
              ? "Please login first."
              : response.status === 404
                ? "Profile endpoint सापडला नाही. Backend mapping तपासा."
                : "Profile load करता आला नाही."
          )
        );
      }

      const data = await response.json();

      const loadedProfile = {
        ...emptyProfile,
        ...data,
        fullName: data.fullName || user?.fullName || "",
        username: data.username || user?.username || "",
      };

      setProfile(loadedProfile);
      setOriginalProfile(loadedProfile);
      setEditing(false);
    } catch (err) {
      console.error("Profile load failed:", err);
      setError(err.message || "Profile load करताना error आला.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load reels uploaded by the logged-in user.
  const loadMyReels = useCallback(async () => {
    setReelsLoading(true);
    setReelsError("");

    try {
      const response = await fetch(`${REELS_API}/my`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          getErrorMessage(
            data,
            response.status === 401
              ? "Please login to view your reels."
              : response.status === 404
                ? "My Reels API सापडली नाही. Backend mapping तपासा."
                : "Your reels load करता आल्या नाहीत."
          )
        );
      }

      const data = await response.json();

      const reelList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      // Newest reels first.
      reelList.sort(
        (a, b) =>
          new Date(b.uploadedAt || 0).getTime() -
          new Date(a.uploadedAt || 0).getTime()
      );

      setReels(reelList);
      setVideoErrors({});
    } catch (err) {
      console.error("My reels load failed:", err);
      setReelsError(err.message || "Reels load करताना error आला.");
    } finally {
      setReelsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadMyReels();
  }, [loadProfile, loadMyReels]);

  // Update profile form fields.
  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Save profile information.
  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(API, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          bio: profile.bio,
          profileImage: profile.profileImage,
          location: profile.location,
          website: profile.website,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            response.status === 401
              ? "Please login first."
              : "Profile save करता आला नाही."
          )
        );
      }

      const savedProfile = {
        ...emptyProfile,
        ...result,
      };

      setProfile(savedProfile);
      setOriginalProfile(savedProfile);
      setEditing(false);
      setMessage("Profile successfully saved!");
    } catch (err) {
      console.error("Profile save failed:", err);
      setError(err.message || "Profile save करताना error आला.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setProfile(originalProfile);
    setEditing(false);
    setMessage("");
    setError("");
  }

  function retryVideo(reelId) {
    setVideoErrors((previous) => ({
      ...previous,
      [reelId]: "",
    }));

    setRetryKeys((previous) => ({
      ...previous,
      [reelId]: (previous[reelId] || 0) + 1,
    }));
  }

  // Delete only the logged-in user's reel.
  async function handleDeleteReel(reel) {
    const confirmed = window.confirm(
      `"${reel.title || "this reel"}" delete करायची आहे का?`
    );

    if (!confirmed) return;

    setDeletingId(reel.id);
    setReelsError("");
    setMessage("");

    try {
      const response = await fetch(`${REELS_API}/${reel.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          getErrorMessage(
            data,
            response.status === 401
              ? "Please login again."
              : response.status === 403
                ? "तुम्ही फक्त स्वतःची reel delete करू शकता."
                : response.status === 404
                  ? "Delete API किंवा reel सापडली नाही."
                  : "Reel delete झाली नाही."
          )
        );
      }

      setReels((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(reel.id)
        )
      );

      setMessage("Reel successfully deleted!");
    } catch (err) {
      console.error("Reel delete failed:", err);
      setReelsError(err.message || "Reel delete करताना error आला.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <LoaderCircle className="profile-spinner" size={25} />
        <span>Loading your profile...</span>
      </div>
    );
  }

  return (
    <main className="stp-profile">
      <header className="stp-profile-header">
        <div>
          <p className="stp-profile-eyebrow">
            SCROLL THE PASSION
          </p>
          <h1>My Profile</h1>
          <p className="stp-profile-subtitle">
            Your identity. Your creativity. Your passion.
          </p>
        </div>

        {!editing && !error && (
          <button
            type="button"
            className="stp-primary-btn"
            onClick={() => {
              setMessage("");
              setError("");
              setEditing(true);
            }}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </header>

      {message && (
        <div className="stp-profile-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="stp-profile-error" role="alert">
          {error}
          <button type="button" onClick={loadProfile}>
            Retry
          </button>
        </div>
      )}

      {/* PROFILE INFORMATION */}
      <section className="stp-profile-card">
        <div className="stp-profile-cover">
          <span className="stp-cover-label">
            DON'T JUST SCROLL. BUILD YOUR FUTURE.
          </span>
        </div>

        <div className="stp-profile-content">
          <div className="stp-profile-avatar">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <UserRound size={43} />
            )}
          </div>

          {!editing ? (
            <div className="stp-profile-view">
              <h2>
                {profile.fullName || user?.fullName || "Your Name"}
              </h2>

              <p className="stp-profile-username">
                @{profile.username || user?.username || "username"}
              </p>

              <p className="stp-profile-bio">
                {profile.bio || "Tell the community about yourself."}
              </p>

              <div className="stp-profile-links">
                {profile.location && (
                  <span>
                    <MapPin size={16} />
                    {profile.location}
                  </span>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe size={16} />
                    Website
                  </a>
                )}
              </div>

              <div className="stp-profile-tip">
                <Camera size={18} />
                <p>
                  Keep your profile updated and let people know
                  what you are passionate about.
                </p>
              </div>
            </div>
          ) : (
            <form className="stp-profile-form" onSubmit={handleSave}>
              <h2>Edit Profile</h2>

              <label>
                Full Name
                <input
                  name="fullName"
                  value={profile.fullName || ""}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Username
                <input
                  name="username"
                  value={profile.username || ""}
                  readOnly
                  placeholder="Your username"
                />
              </label>

              <label>
                Bio
                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={1000}
                />
              </label>

              <label>
                Profile Image URL
                <input
                  name="profileImage"
                  type="url"
                  value={profile.profileImage || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  placeholder="Your city"
                  maxLength={100}
                />
              </label>

              <label>
                Website URL
                <input
                  name="website"
                  type="url"
                  value={profile.website || ""}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </label>

              <div className="stp-profile-actions">
                <button
                  type="submit"
                  className="stp-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle
                      size={17}
                      className="profile-spinner"
                    />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving..." : "Save Profile"}
                </button>

                <button
                  type="button"
                  className="stp-secondary-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* MY REELS: deletion is available only here. */}
      <section className="stp-my-reels">
        <div className="stp-my-reels-header">
          <div>
            <h2>
              <Play size={22} />
              My Reels
            </h2>
            <p>Your uploaded videos in one place.</p>
          </div>

          <button
            type="button"
            className="stp-reels-refresh"
            onClick={loadMyReels}
            disabled={reelsLoading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {reelsError && (
          <div className="stp-profile-error" role="alert">
            {reelsError}
          </div>
        )}

        {reelsLoading ? (
          <div className="stp-reels-status">
            <LoaderCircle
              size={22}
              className="profile-spinner"
            />
            Loading your reels...
          </div>
        ) : reels.length === 0 ? (
          <div className="stp-reels-empty">
            <Play size={35} />
            <h3>No reels uploaded yet</h3>
            <p>Your uploaded reels will appear here.</p>
          </div>
        ) : (
          <div className="stp-reels-grid">
            {reels.map((reel) => {
              const videoUrl = getVideoUrl(reel);
              const hasVideoError = Boolean(videoErrors[reel.id]);

              return (
                <article className="stp-reel-card" key={reel.id}>
                  <div className="stp-reel-video-wrap">
                    {!hasVideoError ? (
                      <video
                        key={`${reel.id}-${retryKeys[reel.id] || 0}`}
                        className="stp-reel-video"
                        src={videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        onError={(event) => {
                          const video = event.currentTarget;

                          console.error("Reel video URL:", videoUrl);
                          console.error(
                            "Video error code:",
                            video.error?.code
                          );

                          setVideoErrors((previous) => ({
                            ...previous,
                            [reel.id]:
                              video.error?.message ||
                              "Video load करता आला नाही.",
                          }));
                        }}
                      />
                    ) : (
                      <div className="stp-video-error">
                        <AlertCircle size={28} />
                        <p>Video load होत नाही.</p>
                        <small>{videoErrors[reel.id]}</small>

                        <button
                          type="button"
                          onClick={() => retryVideo(reel.id)}
                        >
                          <RefreshCw size={15} />
                          Retry Video
                        </button>
                      </div>
                    )}

                    {!hasVideoError && (
                      <button
                        type="button"
                        className="stp-play-reel-btn"
                        onClick={(event) => {
                          event.stopPropagation();

                          const video =
                            event.currentTarget.parentElement.querySelector(
                              "video"
                            );

                          if (!video) return;

                          if (video.paused) {
                            video.play().catch((err) => {
                              console.error(
                                "Unable to play reel:",
                                err
                              );

                              setVideoErrors((previous) => ({
                                ...previous,
                                [reel.id]:
                                  "Video play होऊ शकत नाही. Video URL तपासा.",
                              }));
                            });
                          } else {
                            video.pause();
                          }
                        }}
                      >
                        <Play size={16} />
                        Play Reel
                      </button>
                    )}
                  </div>

                  <div className="stp-reel-details">
                    <span className="stp-reel-category">
                      {reel.category || "General"}
                    </span>

                    <h3>{reel.title || "Untitled Reel"}</h3>

                    {reel.uploadedAt && (
                      <p className="stp-reel-date">
                        Uploaded:{" "}
                        {new Date(reel.uploadedAt).toLocaleDateString()}
                      </p>
                    )}

                    <button
                      type="button"
                      className="stp-delete-reel-btn"
                      onClick={() => handleDeleteReel(reel)}
                      disabled={deletingId === reel.id}
                    >
                      {deletingId === reel.id ? (
                        <LoaderCircle
                          size={16}
                          className="profile-spinner"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      {deletingId === reel.id
                        ? "Deleting..."
                        : "Delete Reel"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;
