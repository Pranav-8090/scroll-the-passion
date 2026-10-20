import React, { useMemo, useState } from "react";
import {
  Clapperboard,
  Heart,
  Bookmark,
  Users,
  Eye,
  TrendingUp,
  Play,
  BarChart3,
  Search,
  Video,
  Sparkles,
} from "lucide-react";
import "./CreatorDashboard.css";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value instanceof Set) return Array.from(value);
  if (value && typeof value === "object") {
    return Object.keys(value);
  }
  return [];
}

function CreatorDashboard({
  reels = [],
  liked = [],
  saved = [],
  following = [],
}) {
  const [reelSearch, setReelSearch] = useState("");
  const [reelFilter, setReelFilter] = useState("all");

  const likedItems = toArray(liked);
  const savedItems = toArray(saved);
  const followingItems = toArray(following);

  const likedIds = new Set(likedItems.map(String));
  const savedIds = new Set(savedItems.map(String));

  const totalViews = reels.reduce(
    (sum, reel) => sum + (Number(reel.views) || 0),
    0
  );

  const totalLikes = reels.reduce(
    (sum, reel) => sum + (Number(reel.likes) || 0),
    0
  );

  const reelsWithViews = useMemo(
    () =>
      [...reels]
        .filter((reel) => Number(reel.views) > 0)
        .sort(
          (a, b) =>
            (Number(b.views) || 0) - (Number(a.views) || 0)
        )
        .slice(0, 5),
    [reels]
  );

  const maxViews = Math.max(
    1,
    ...reelsWithViews.map((reel) => Number(reel.views) || 0)
  );

  const filteredReels = useMemo(() => {
    const query = reelSearch.trim().toLowerCase();

    return reels.filter((reel) => {
      const id = String(reel.id ?? "");

      const title = String(reel.title || "").toLowerCase();
      const creator = String(reel.creator || "").toLowerCase();
      const category = String(reel.category || "").toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        creator.includes(query) ||
        category.includes(query);

      const matchesFilter =
        reelFilter === "all" ||
        (reelFilter === "liked" && likedIds.has(id)) ||
        (reelFilter === "saved" && savedIds.has(id));

      return matchesSearch && matchesFilter;
    });
  }, [reels, reelSearch, reelFilter, liked, saved]);

  const metrics = [
    {
      title: "Total Reels",
      value: reels.length.toLocaleString(),
      icon: Clapperboard,
      note: "Reels available in this feed",
    },
    {
      title: "Views Tracked",
      value: totalViews.toLocaleString(),
      icon: Eye,
      note: "Based on available view data",
    },
    {
      title: "Reel Likes",
      value: totalLikes.toLocaleString(),
      icon: Heart,
      note: "Like totals from reel data",
    },
    {
      title: "Following",
      value: followingItems.length.toLocaleString(),
      icon: Users,
      note: "Creators you follow",
    },
  ];

  return (
    <section className="creator-dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">
            SCROLL THE PASSION · CREATOR STUDIO
          </p>

          <h1>Creator Dashboard</h1>

          <p className="dashboard-subtitle">
            Understand your activity, explore reel statistics,
            and keep your content organized.
          </p>
        </div>

        <div className="dashboard-heading-icon">
          <BarChart3 size={28} />
        </div>
      </header>

      {/* Welcome Card */}
      <section className="creator-welcome-card">
        <div className="creator-avatar">
          <Video size={26} />
        </div>

        <div className="creator-welcome-copy">
          <span className="creator-welcome-label">
            <Sparkles size={14} />
            YOUR CREATOR SPACE
          </span>

          <h2>Keep creating. Keep growing.</h2>

          <p>Don't Just Scroll. Build Your Future.</p>
        </div>

        <div className="creator-welcome-badge">
          <Clapperboard size={16} />
          <span>{reels.length} reels</span>
        </div>
      </section>

      {/* Statistics Cards */}
      <div className="dashboard-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              className="dashboard-metric"
              key={metric.title}
            >
              <div className="metric-top">
                <span>{metric.title}</span>

                <span className="metric-icon">
                  <Icon size={19} />
                </span>
              </div>

              <h2>{metric.value}</h2>

              <p>{metric.note}</p>
            </article>
          );
        })}
      </div>

      {/* Performance and Activity */}
      <div className="dashboard-content-grid">
        <section className="dashboard-panel performance-panel">
          <div className="panel-heading">
            <div>
              <h2>Reel Performance</h2>
              <p>Top 5 reels with recorded view counts</p>
            </div>

            <TrendingUp size={21} />
          </div>

          {reelsWithViews.length === 0 ? (
            <div className="dashboard-empty">
              <BarChart3 size={34} />

              <h3>No performance data yet</h3>

              <p>
                The chart will appear when your reel objects
                contain a numeric views value greater than zero.
              </p>
            </div>
          ) : (
            <div className="performance-chart">
              {reelsWithViews.map((reel, index) => {
                const views = Number(reel.views) || 0;
                const width = Math.max(
                  (views / maxViews) * 100,
                  2
                );

                return (
                  <div
                    className="performance-row"
                    key={reel.id ?? index}
                  >
                    <div className="performance-label">
                      <span>
                        {reel.title ||
                          reel.creator ||
                          `Reel ${index + 1}`}
                      </span>

                      <strong>{views.toLocaleString()}</strong>
                    </div>

                    <div className="performance-track">
                      <div
                        className="performance-bar"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-panel quick-stats-panel">
          <div className="panel-heading">
            <div>
              <h2>Your Activity</h2>
              <p>Activity from your current session</p>
            </div>

            <Heart size={21} />
          </div>

          <div className="activity-row">
            <span className="activity-icon">
              <Heart size={18} />
            </span>

            <div>
              <strong>Liked Reels</strong>
              <p>Reels you have liked</p>
            </div>

            <b>{likedItems.length}</b>
          </div>

          <div className="activity-row">
            <span className="activity-icon">
              <Bookmark size={18} />
            </span>

            <div>
              <strong>Saved Reels</strong>
              <p>Reels saved for later</p>
            </div>

            <b>{savedItems.length}</b>
          </div>

          <div className="activity-row">
            <span className="activity-icon">
              <Users size={18} />
            </span>

            <div>
              <strong>Following</strong>
              <p>Creators you follow</p>
            </div>

            <b>{followingItems.length}</b>
          </div>

          <div className="dashboard-info">
            <Eye size={17} />

            <p>
              Analytics are based on values available in your app.
              Views and likes are not automatically collected by a
              backend.
            </p>
          </div>
        </section>
      </div>

      {/* Reel Library */}
      <section className="dashboard-panel reel-library-panel">
        <div className="panel-heading reel-library-heading">
          <div>
            <h2>Reel Library</h2>
            <p>Search reels currently available in the feed</p>
          </div>

          <Clapperboard size={21} />
        </div>

        {/* Search */}
        <div className="reel-library-controls">
          <label className="dashboard-search">
            <Search size={17} />

            <input
              type="search"
              value={reelSearch}
              onChange={(event) =>
                setReelSearch(event.target.value)
              }
              placeholder="Search title, creator, or category..."
              aria-label="Search reels"
            />
          </label>

          {/* Filters */}
          <div className="reel-filter-tabs">
            <button
              type="button"
              className={reelFilter === "all" ? "active" : ""}
              onClick={() => setReelFilter("all")}
            >
              All Reels
            </button>

            <button
              type="button"
              className={reelFilter === "liked" ? "active" : ""}
              onClick={() => setReelFilter("liked")}
            >
              <Heart size={14} />
              Liked
            </button>

            <button
              type="button"
              className={reelFilter === "saved" ? "active" : ""}
              onClick={() => setReelFilter("saved")}
            >
              <Bookmark size={14} />
              Saved
            </button>
          </div>
        </div>

        {/* Reel List */}
        {filteredReels.length === 0 ? (
          <div className="dashboard-empty reel-library-empty">
            <Clapperboard size={32} />

            <h3>No reels found</h3>

            <p>
              {reelFilter === "liked"
                ? "You have not liked any reels matching this search."
                : reelFilter === "saved"
                ? "You have not saved any reels matching this search."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="dashboard-reels-list">
            {filteredReels.map((reel, index) => (
              <article
                className="dashboard-reel-row"
                key={reel.id ?? `${reel.title || "reel"}-${index}`}
              >
                <div className="dashboard-reel-thumbnail">
                  <Play size={18} fill="currentColor" />
                </div>

                <div className="dashboard-reel-details">
                  <h3>{reel.title || `Reel ${index + 1}`}</h3>

                  <p>
                    {reel.creator
                      ? `@${reel.creator}`
                      : "Creator"}

                    {reel.category
                      ? ` · ${reel.category}`
                      : ""}
                  </p>
                </div>

                <div className="dashboard-reel-stat" title="Views">
                  <Eye size={15} />
                  {Number(reel.views || 0).toLocaleString()}
                </div>

                <div className="dashboard-reel-stat" title="Likes">
                  <Heart size={15} />
                  {Number(reel.likes || 0).toLocaleString()}
                </div>

                {likedIds.has(String(reel.id)) && (
                  <span className="reel-state-icon" title="Liked">
                    <Heart size={15} fill="currentColor" />
                  </span>
                )}

                {savedIds.has(String(reel.id)) && (
                  <span className="reel-state-icon" title="Saved">
                    <Bookmark size={15} fill="currentColor" />
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="dashboard-footer-note">
        <Sparkles size={14} />
        Your dashboard reflects the current React app state.
        Add backend storage to preserve data after refresh.
      </p>
    </section>
  );
}

export default CreatorDashboard;