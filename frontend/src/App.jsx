
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  Compass,
  LayoutDashboard,
  Bookmark,
  Check,
  Heart,
  MessageCircle,
  Play,
  Plus,
  Search,
  Send,
  Share2,
  Volume2,
  VolumeX,
  X,
  UserRound,
  LogOut,
} from "lucide-react";

import CreatorDashboard from "./components/CreatorDashboard";
import Explore from "./components/Explore";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";

import {
  uploadReel,
  getAllReels,
  getMyReels,
  getReelVideoUrl,
} from "./services/reelService";

import { logoutUser } from "./services/authService";

import "./App.css";
import "./components/Auth.css";

const categories = [
  "For You",
  "Java",
  "Python",
  "React",
  "AI & ML",
  "Career",
];

export const demoReels = [
  {
    id: 1,
    isSaved: false,
    creator: "coding_community",
    name: "Coding Community",
    category: "Java",
    title: "Learn Coding 💻",
    description: "Learn coding and improve your programming skills.",
    likes: 2480,
    comments: 126,
    image: "",
    videoUrl: "/videos/coding.mp4",
    tags: ["Coding", "Programming"],
  },
  {
    id: 2,
    isSaved: false,
    creator: "mpsc_updates",
    name: "MPSC Preparation",
    category: "Career",
    title: "MPSC Preparation 📚",
    description: "Prepare for your MPSC competitive exams.",
    likes: 5310,
    comments: 204,
    image: "",
    videoUrl: "/videos/mpsc.mp4",
    tags: ["MPSC", "GovernmentJobs"],
  },
  {
    id: 3,
    isSaved: false,
    creator: "motivation_daily",
    name: "Motivation Daily",
    category: "Career",
    title: "Stay Motivated 🔥",
    description: "Stay focused on your goals and keep learning.",
    likes: 1870,
    comments: 89,
    image: "",
    videoUrl: "/videos/motivation.mp4",
    tags: ["Motivation", "Success"],
  },
  {
    id: 4,
    isSaved: false,
    creator: "success_mindset",
    name: "Success Mindset",
    category: "Career",
    title: "Never Give Up 💪",
    description: "Small steps every day lead to big results.",
    likes: 3940,
    comments: 173,
    image: "",
    videoUrl: "/videos/motivation2.mp4",
    tags: ["Motivation", "Growth"],
  },
  {
    id: 5,
    isSaved: false,
    creator: "ca_guidance",
    name: "CA Guidance",
    category: "Career",
    title: "Start Your CA Journey 📖",
    description: "Explore the Chartered Accountancy career path.",
    likes: 2160,
    comments: 98,
    image: "",
    videoUrl: "/videos/CA.mp4",
    tags: ["CA", "Career"],
  },
  {
    id: 6,
    isSaved: false,
    creator: "webdev_community",
    name: "Web Development",
    category: "React",
    title: "Learn Web Development 🌐",
    description: "Explore HTML, CSS, JavaScript and React.",
    likes: 3250,
    comments: 145,
    image: "",
    videoUrl: "/videos/web%20dev.mp4",
    tags: ["WebDevelopment", "React"],
  },
];

function formatCount(number = 0) {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return String(number);
}

function getReelList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function mapSavedReel(reel, user = null) {
  const category = reel.category || "Java";

  const backendVideoPath =
    reel.videoUrl || `/api/reels/${reel.id}/video`;

  const videoUrl = /^https?:\/\//i.test(backendVideoPath)
    ? backendVideoPath
    : getReelVideoUrl(backendVideoPath);

  return {
    ...reel,
    id: reel.id,
    isSaved: true,
    userId: reel.userId ?? reel.user?.id ?? null,

    creator:
      reel.username ||
      reel.creator ||
      reel.user?.username ||
      user?.username ||
      "creator",

    name:
      reel.fullName ||
      reel.name ||
      reel.user?.fullName ||
      user?.fullName ||
      reel.username ||
      reel.user?.username ||
      user?.username ||
      "Creator",

    category,
    title: reel.title || "Untitled Reel",
    description: reel.description || reel.title || "",
    likes: reel.likes ?? 0,
    comments: reel.comments ?? 0,
    image: reel.image || "",
    videoUrl,
    tags: Array.isArray(reel.tags) ? reel.tags : [category],
  };
}

function AuthScreen({ onLogin }) {
  const [page, setPage] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");

  const handleShowLogin = (email = "") => {
    setLoginEmail(email);
    setPage("login");
  };

  if (page === "register") {
    return <Register onShowLogin={handleShowLogin} />;
  }

  return (
    <Login
      initialEmail={loginEmail}
      onLoginSuccess={onLogin}
      onShowRegister={() => setPage("register")}
    />
  );
}

function ReelCard({
  reel,
  liked,
  saved,
  following,
  muted,
  comments,
  onLike,
  onSave,
  onFollow,
  onShare,
  onComment,
  onToggleMute,
}) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (
      !video ||
      !reel.videoUrl ||
      videoError ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.25, 0.65, 1] }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reel.videoUrl, videoError]);

  return (
    <article className="reel-page" data-reel-id={String(reel.id)}>
      <div className="reel-media">
        {reel.videoUrl && !videoError ? (
          <video
            ref={videoRef}
            className="reel-video"
            src={reel.videoUrl}
            poster={reel.image || undefined}
            loop
            muted={muted}
            playsInline
            preload="metadata"
            controls={false}
            onError={() => setVideoError(true)}
            onClick={(event) => {
              const video = event.currentTarget;

              if (video.paused) {
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            }}
          />
        ) : reel.image ? (
          <img
            className="reel-image"
            src={reel.image}
            alt={reel.title}
          />
        ) : (
          <div className="reel-video-placeholder">
            <Play size={42} />
            <p>
              {videoError
                ? "Video unavailable"
                : "Add a video to play this Reel"}
            </p>
            <small>{reel.category}</small>
          </div>
        )}

        <div className="reel-gradient" />

        <div className="reel-top-label">
          <span className="learning-badge">✦ Learn something new</span>

          <button
            type="button"
            className="round-action sound-action"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>

        <div className="reel-info">
          <span className="reel-topic">{reel.category}</span>

          <div className="reel-creator">
            <div className="creator-avatar">
              {(reel.name || reel.creator || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <strong>{reel.name || reel.creator}</strong>

            <button
              type="button"
              className={`follow-button ${
                following ? "is-following" : ""
              }`}
              onClick={onFollow}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>

          <h2>{reel.title}</h2>
          <p>{reel.description}</p>

          <div className="reel-hashtags">
            {(reel.tags || []).map((tag, index) => (
              <span key={`${tag}-${index}`}>
                #{String(tag).replaceAll(" ", "")}
              </span>
            ))}
          </div>

          <div className="reel-audio">
            <span className="audio-disc">♫</span>
            <span>@{reel.creator} · Scroll The Passion original</span>
          </div>
        </div>

        <div className="reel-actions">
          <button
            type="button"
            className={`reel-action ${liked ? "action-liked" : ""}`}
            onClick={onLike}
            aria-label="Like reel"
          >
            <span className="action-icon">
              <Heart fill={liked ? "currentColor" : "none"} />
            </span>
            <span>{formatCount((reel.likes || 0) + (liked ? 1 : 0))}</span>
          </button>

          <button
            type="button"
            className="reel-action"
            onClick={onComment}
            aria-label="Open comments"
          >
            <span className="action-icon">
              <MessageCircle />
            </span>
            <span>{(reel.comments || 0) + comments}</span>
          </button>

          <button
            type="button"
            className={`reel-action ${saved ? "action-saved" : ""}`}
            onClick={onSave}
            aria-label="Save reel"
          >
            <span className="action-icon">
              <Bookmark fill={saved ? "currentColor" : "none"} />
            </span>
            <span>Save</span>
          </button>

          <button
            type="button"
            className="reel-action"
            onClick={onShare}
            aria-label="Share reel"
          >
            <span className="action-icon">
              <Share2 />
            </span>
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [userReels, setUserReels] = useState([]);
  const [allUploadedReels, setAllUploadedReels] = useState([]);

  const [reelsLoading, setReelsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [following, setFollowing] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentReel, setCommentReel] = useState(null);

  const [activeCategory, setActiveCategory] = useState("For You");
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Home");
  const [notice, setNotice] = useState("");
  const [muted, setMuted] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [reelTitle, setReelTitle] = useState("");
  const [reelCategory, setReelCategory] = useState("Java");
  const [reelVideo, setReelVideo] = useState(null);
  const [reelPreview, setReelPreview] = useState("");

  function notify(message) {
    setNotice(message);
  }

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!currentUser) {
      setComments({});
      return;
    }

    const userId = currentUser.id ?? currentUser.userId;
    const storageKey = `scrollThePassion_comments_${userId}`;

    try {
      const stored = localStorage.getItem(storageKey);
      setComments(stored ? JSON.parse(stored) : {});
    } catch (error) {
      console.error("Comments load error:", error);
      setComments({});
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setLiked([]);
      return;
    }

    const userId = currentUser.id ?? currentUser.userId;
    const storageKey = `scrollThePassion_likes_${userId}`;

    try {
      const stored = localStorage.getItem(storageKey);
      setLiked(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Unable to load likes:", error);
      setLiked([]);
    }
  }, [currentUser]);

  // Backend session check
  useEffect(() => {
    let active = true;

    async function checkLogin() {
      try {
        const response = await fetch(
            "https://scroll-the-passion-backend.onrender.com/api/auth/me",
          {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          if (active) setCurrentUser(null);
          return;
        }

        const user = await response.json();

        if (
          active &&
          user &&
          (user.id != null || user.userId != null)
        ) {
          setCurrentUser(user);
        } else if (active) {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        if (active) setCurrentUser(null);
      } finally {
        if (active) setAuthChecked(true);
      }
    }

    checkLogin();

    return () => {
      active = false;
    };
  }, []);

  // Load own reels and all users' reels
useEffect(() => {
  if (!currentUser) {
    setUserReels([]);
    setAllUploadedReels([]);
    setReelsLoading(false);
    return undefined;
  }

  let active = true;

  async function loadReels() {
    setReelsLoading(true);

    try {
      const [myResult, allResult] = await Promise.allSettled([
        getMyReels(),
        getAllReels(),
      ]);

      if (!active) return;

      let myList = [];
      let allList = [];

      if (myResult.status === "fulfilled") {
        myList = getReelList(myResult.value);
      } else {
        console.error(
          "getMyReels API error:",
          myResult.reason?.response?.status,
          myResult.reason?.config?.url,
          myResult.reason
        );
      }

      if (allResult.status === "fulfilled") {
        allList = getReelList(allResult.value);
      } else {
        console.error(
          "getAllReels API error:",
          allResult.reason?.response?.status,
          allResult.reason?.config?.url,
          allResult.reason
        );
      }

      // Fallback: get own reels from all reels if /my fails.
      if (myResult.status !== "fulfilled") {
        const loggedInUserId = String(
          currentUser.id ?? currentUser.userId ?? ""
        );

        myList = allList.filter(
          (reel) =>
            String(reel.userId ?? reel.user?.id ?? "") ===
            loggedInUserId
        );
      }

      // Remove duplicate reels using their IDs.
      const merged = [...allList, ...myList];

      const uniqueReels = Array.from(
        new Map(
          merged.map((reel) => [String(reel.id), reel])
        ).values()
      );

      if (
        myResult.status === "fulfilled" ||
        allResult.status === "fulfilled"
      ) {
        setUserReels(
          myList.map((reel) => mapSavedReel(reel, currentUser))
        );

        setAllUploadedReels(
          uniqueReels.map((reel) => mapSavedReel(reel, currentUser))
        );
      } else {
        notify("Unable to load reels. Check backend API.");
      }
    } catch (error) {
      console.error("Unable to load reels:", error);

      if (active) {
        notify("Unable to load reels. Check backend and login session.");
      }
    } finally {
      if (active) {
        setReelsLoading(false);
      }
    }
  }

  loadReels();

  return () => {
    active = false;
  };
}, [currentUser]);

  // Home feed includes all uploaded reels plus demo reels.
  const allReels = useMemo(
    () => [...allUploadedReels, ...demoReels],
    [allUploadedReels]
  );

  const reels = useMemo(() => {
    let list = [...allReels];

    if (activePage === "Liked") {
      list = list.filter((reel) => liked.includes(reel.id));
    } else if (activePage === "Saved") {
      list = list.filter((reel) => saved.includes(reel.id));
    } else if (
      activePage !== "Explore" &&
      activePage !== "Dashboard" &&
      activePage !== "Profile" &&
      activeCategory !== "For You"
    ) {
      list = list.filter((reel) => reel.category === activeCategory);
    }

    const term = search.trim().toLowerCase();

    if (term) {
      list = list.filter((reel) =>
        [
          reel.title,
          reel.name,
          reel.creator,
          reel.category,
          reel.description,
          ...(reel.tags || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    return list;
  }, [allReels, activePage, activeCategory, search, liked, saved]);

  function selectPage(page) {
    setActivePage(page);
    setSearch("");
    setActiveCategory("For You");
  }

  function toggleLike(id) {
    const userId = currentUser?.id ?? currentUser?.userId;

    if (userId == null) {
      notify("Please login to like a reel.");
      return;
    }

    const storageKey = `scrollThePassion_likes_${userId}`;

    const updated = liked.includes(id)
      ? liked.filter((item) => item !== id)
      : [...liked, id];

    setLiked(updated);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (error) {
      console.error("Unable to save likes:", error);
      notify("Unable to save your like.");
    }
  }

  function toggleSave(id) {
    const alreadySaved = saved.includes(id);

    setSaved((current) =>
      alreadySaved
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

    notify(alreadySaved ? "Removed from saved reels" : "Reel saved!");
  }

  function toggleFollow(creator) {
    setFollowing((current) =>
      current.includes(creator)
        ? current.filter((item) => item !== creator)
        : [...current, creator]
    );
  }

  async function shareReel(reel) {
    const text = `${reel.title} — Scroll The Passion`;

    const shareUrl = reel.videoUrl
      ? new URL(reel.videoUrl, window.location.origin).href
      : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: reel.title,
          text,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
        notify("Reel link copied!");
      } else {
        notify("Sharing is not supported in this browser.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        notify("Unable to share right now.");
      }
    }
  }

  function addComment(event) {
    event.preventDefault();

    if (!commentReel || !commentText.trim()) return;

    const userId = currentUser?.id ?? currentUser?.userId;

    if (userId == null) {
      notify("Please login to comment.");
      return;
    }

    const storageKey = `scrollThePassion_comments_${userId}`;
    let storedComments = {};

    try {
      storedComments = JSON.parse(
        localStorage.getItem(storageKey) || "{}"
      );
    } catch (error) {
      console.error("Comments load error:", error);
    }

    const newComment = commentText.trim();

    const updatedComments = {
      ...storedComments,
      [commentReel.id]: [
        ...(storedComments[commentReel.id] || []),
        newComment,
      ],
    };

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedComments)
      );

      setComments(updatedComments);
      setCommentText("");
    } catch (error) {
      console.error("Comment save error:", error);
      notify("Unable to save comment.");
    }
  }

  function closeUpload() {
    if (reelPreview) URL.revokeObjectURL(reelPreview);

    setReelTitle("");
    setReelCategory("Java");
    setReelVideo(null);
    setReelPreview("");
    setShowUpload(false);
  }

  function handleVideoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      notify("Please select a video file.");
      event.target.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      notify("Video must be smaller than 100 MB.");
      event.target.value = "";
      return;
    }

    if (reelPreview) URL.revokeObjectURL(reelPreview);

    setReelVideo(file);
    setReelPreview(URL.createObjectURL(file));
  }

  async function handleCreateReel(event) {
    event.preventDefault();

    if (isUploading) return;

    if (!reelTitle.trim() || !reelVideo) {
      notify("Enter a title and select a video.");
      return;
    }

    setIsUploading(true);

    try {
      await uploadReel({
        file: reelVideo,
        title: reelTitle.trim(),
        category: reelCategory,
      });

      const [myData, allData] = await Promise.all([
        getMyReels(),
        getAllReels(),
      ]);

      const myList = getReelList(myData);
      const allList = getReelList(allData);

      setUserReels(
        myList.map((reel) => mapSavedReel(reel, currentUser))
      );

      const merged = [...allList, ...myList];

      const uniqueReels = Array.from(
        new Map(
          merged.map((reel) => [String(reel.id), reel])
        ).values()
      );

      setAllUploadedReels(
        uniqueReels.map((reel) => mapSavedReel(reel, currentUser))
      );

      closeUpload();
      setActivePage("Home");
      setActiveCategory("For You");
      setSearch("");

      notify("Reel uploaded successfully!");
    } catch (error) {
      console.error("Reel upload failed:", error);

      notify(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Reel upload failed. Check backend and login session."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      if (reelPreview) URL.revokeObjectURL(reelPreview);

      setCurrentUser(null);
      setLiked([]);
      setSaved([]);
      setFollowing([]);
      setComments({});
      setUserReels([]);
      setAllUploadedReels([]);
      setReelTitle("");
      setReelCategory("Java");
      setReelVideo(null);
      setReelPreview("");
      setShowUpload(false);
      setActivePage("Home");
      setActiveCategory("For You");
      setSearch("");

      notify("You have logged out.");
    }
  }

  if (!authChecked) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p>Loading Scroll The Passion...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={(user) => {
          setCurrentUser(user);
          setActivePage("Home");
        }}
      />
    );
  }

  const displayName =
    currentUser.fullName ||
    currentUser.username ||
    currentUser.email ||
    "User";

  return (
    <div className="reels-app instagram-layout">
      <aside className="app-sidebar">
        <button
          type="button"
          className="sidebar-brand"
          onClick={() => selectPage("Home")}
          aria-label="Scroll The Passion home"
        >
          <span className="sidebar-brand-icon">
            <Play size={20} fill="currentColor" />
          </span>

          <span className="sidebar-brand-text">
            <strong>Scroll The Passion</strong>
            <small>LEARN · CREATE · GROW</small>
          </span>
        </button>

        <p className="sidebar-section-label">MENU</p>

        <nav className="sidebar-links">
          <button
            type="button"
            className={`sidebar-link ${activePage === "Home" ? "active" : ""}`}
            onClick={() => selectPage("Home")}
          >
            <Home size={21} />
            <span>Home / Reels</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === "Explore" ? "active" : ""}`}
            onClick={() => selectPage("Explore")}
          >
            <Compass size={21} />
            <span>Explore</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === "Liked" ? "active" : ""}`}
            onClick={() => selectPage("Liked")}
          >
            <Heart size={21} />
            <span>Liked Reels</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === "Saved" ? "active" : ""}`}
            onClick={() => selectPage("Saved")}
          >
            <Bookmark size={21} />
            <span>Saved Reels</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === "Dashboard" ? "active" : ""}`}
            onClick={() => selectPage("Dashboard")}
          >
            <LayoutDashboard size={21} />
            <span>Creator Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === "Profile" ? "active" : ""}`}
            onClick={() => selectPage("Profile")}
          >
            <UserRound size={21} />
            <span>My Profile</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-create-button"
            onClick={() => setShowUpload(true)}
          >
            <Plus size={20} />
            <span>Create Reel</span>
          </button>

          <p>Made for creators 🚀</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="reels-header">
          <button
            type="button"
            className="wordmark"
            onClick={() => selectPage("Home")}
          >
            <span className="wordmark-icon">
              <Play fill="currentColor" size={18} />
            </span>

            <span>
              <strong>
                scroll<span>the</span>passion
              </strong>
              <small>LEARN · CREATE · GROW</small>
            </span>
          </button>

          <label className="reels-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);

                if (["Explore", "Dashboard", "Profile"].includes(activePage)) {
                  setActivePage("Home");
                }
              }}
              placeholder="Search reels..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </label>

          <button
            type="button"
            className="create-reel-button"
            onClick={() => setShowUpload(true)}
          >
            <Plus size={18} />
            <span>Create Reel</span>
          </button>

          <div className="logged-in-user">
            <span className="logged-in-avatar">
              {displayName.charAt(0).toUpperCase()}
            </span>

            <span className="logged-in-name">{displayName}</span>

            <button
              type="button"
              className="logout-reels-button"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <nav className="reels-nav">
          <button
            type="button"
            className={activePage === "Home" ? "nav-selected" : ""}
            onClick={() => selectPage("Home")}
          >
            <Play size={17} /> Reels
          </button>

          <button
            type="button"
            className={activePage === "Explore" ? "nav-selected" : ""}
            onClick={() => selectPage("Explore")}
          >
            <Search size={17} /> Explore
          </button>

          <button
            type="button"
            className={activePage === "Liked" ? "nav-selected" : ""}
            onClick={() => selectPage("Liked")}
          >
            <Heart size={17} /> Liked
          </button>

          <button
            type="button"
            className={activePage === "Saved" ? "nav-selected" : ""}
            onClick={() => selectPage("Saved")}
          >
            <Bookmark size={17} /> Saved
          </button>

          <button
            type="button"
            className={activePage === "Profile" ? "nav-selected" : ""}
            onClick={() => selectPage("Profile")}
          >
            <UserRound size={17} /> Profile
          </button>
        </nav>

        {activePage === "Dashboard" ? (
          <main className="dashboard-page-wrapper">
            <CreatorDashboard
              reels={allReels}
              liked={liked}
              saved={saved}
              following={following}
            />
          </main>
        ) : activePage === "Explore" ? (
          <main className="explore-page-wrapper">
            <Explore
              reels={allUploadedReels}
              loading={reelsLoading}
            />
          </main>
        ) : activePage === "Profile" ? (
          <main className="profile-page-wrapper">
            <Profile user={currentUser} />
          </main>
        ) : (
          <>
            <div className="category-strip">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={activeCategory === category ? "category-active" : ""}
                  onClick={() => {
                    setActiveCategory(category);
                    setActivePage("Home");
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <main
              className="reels-feed"
              key={`${activePage}-${activeCategory}-${search}`}
            >
              {reelsLoading ? (
                <div className="no-reels">
                  <p>Loading reels...</p>
                </div>
              ) : reels.length ? (
                reels.map((reel) => (
                  <ReelCard
                    key={`${reel.isSaved ? "uploaded" : "demo"}-${reel.id}`}
                    reel={reel}
                    liked={liked.includes(reel.id)}
                    saved={saved.includes(reel.id)}
                    following={following.includes(reel.creator)}
                    muted={muted}
                    comments={(comments[reel.id] || []).length}
                    onLike={() => toggleLike(reel.id)}
                    onSave={() => toggleSave(reel.id)}
                    onFollow={() => toggleFollow(reel.creator)}
                    onShare={() => shareReel(reel)}
                    onComment={() => setCommentReel(reel)}
                    onToggleMute={() => setMuted((value) => !value)}
                  />
                ))
              ) : (
                <div className="no-reels">
                  <Play size={34} />
                  <h2>No reels here yet</h2>
                  <p>Like, save, or create a Reel to see it here.</p>

                  <button
                    type="button"
                    onClick={() => selectPage("Explore")}
                  >
                    Explore Reels
                  </button>
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {notice && (
        <div className="reels-toast">
          <Check size={17} />
          {notice}

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {showUpload && (
        <div
          className="reels-modal-backdrop"
          onClick={closeUpload}
        >
          <section
            className="reels-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create a Reel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>Create a Reel</h2>

              <button
                type="button"
                onClick={closeUpload}
                aria-label="Close"
                disabled={isUploading}
              >
                <X />
              </button>
            </div>

            <form
              className="reels-upload-form"
              onSubmit={handleCreateReel}
            >
              <label htmlFor="new-reel-title">Title</label>

              <input
                id="new-reel-title"
                value={reelTitle}
                onChange={(event) => setReelTitle(event.target.value)}
                placeholder="What will people learn?"
                maxLength={150}
                required
                disabled={isUploading}
              />

              <label htmlFor="new-reel-category">Category</label>

              <select
                id="new-reel-category"
                value={reelCategory}
                onChange={(event) => setReelCategory(event.target.value)}
                disabled={isUploading}
              >
                {categories
                  .filter((item) => item !== "For You")
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>

              <label htmlFor="new-reel-video">Choose video</label>

              <input
                id="new-reel-video"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                required
                disabled={isUploading}
              />

              {reelVideo && <p className="file-name">{reelVideo.name}</p>}

              {reelPreview && (
                <video
                  className="upload-preview"
                  src={reelPreview}
                  controls
                  playsInline
                />
              )}

              <p className="upload-note">
                Video only · Maximum size 100 MB
              </p>

              <button
                className="publish-reel-button"
                type="submit"
                disabled={isUploading}
              >
                {isUploading ? (
                  "Uploading Reel..."
                ) : (
                  <>
                    <Plus size={18} /> Publish Reel
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      )}

      {commentReel && (
        <div
          className="reels-modal-backdrop"
          onClick={() => setCommentReel(null)}
        >
          <section
            className="reels-modal comments-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>Comments</h2>

              <button
                type="button"
                onClick={() => setCommentReel(null)}
                aria-label="Close comments"
              >
                <X />
              </button>
            </div>

            <p className="commented-title">{commentReel.title}</p>

            <div className="comments-list">
              {(comments[commentReel.id] || []).length === 0 ? (
                <p className="empty-comments">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                (comments[commentReel.id] || []).map((comment, index) => (
                  <div
                    className="comment-row"
                    key={`${index}-${comment}`}
                  >
                    <span className="creator-avatar">
                      {comment.charAt(0).toUpperCase()}
                    </span>
                    <p>{comment}</p>
                  </div>
                ))
              )}
            </div>

            <form className="comment-input-row" onSubmit={addComment}>
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
              />

              <button type="submit" aria-label="Send comment">
                <Send size={18} />
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
