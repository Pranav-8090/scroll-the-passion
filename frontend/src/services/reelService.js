
import axios from "axios";

const API = "http://localhost:8085/api/reels";

const reelAPI = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Upload a new reel
export const uploadReel = async ({ file, title, category }) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", title);
  formData.append("category", category);

  const response = await reelAPI.post("/upload", formData);

  return response.data;
};

// Get only the logged-in user's reels
export const getMyReels = async () => {
  const response = await reelAPI.get("/my");

  return response.data;
};

// Get reels uploaded by ALL users
export const getAllReels = async () => {
  const response = await reelAPI.get("");

  return response.data;
};

// Build the complete URL for a reel video
export const getReelVideoUrl = (videoUrl) => {
  if (!videoUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(videoUrl)) {
    return videoUrl;
  }

  const path = videoUrl.startsWith("/")
    ? videoUrl
    : `/${videoUrl}`;

  return `http://localhost:8085${path}`;
};

// Delete a reel (the backend must verify ownership)
export const deleteReel = async (reelId) => {
  if (reelId === null || reelId === undefined) {
    throw new Error("Reel ID is required.");
  }

  const response = await reelAPI.delete(
    `/${encodeURIComponent(reelId)}`
  );

  return response.data;
};

export default reelAPI;
