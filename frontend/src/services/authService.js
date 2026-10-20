
import axios from "axios";

const API = "https://scroll-the-passion-backend.onrender.com/api/auth";

const authAPI = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (userData) => {
  try {
    const response = await authAPI.post("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Register Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Account create failed"
    );
  }
};

export const loginUser = async (loginData) => {
  try {
    const response = await authAPI.post("/login", loginData);
    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Login failed"
    );
  }
};

export const logoutUser = async () => {
  try {
    const response = await authAPI.post("/logout");
    return response.data;
  } catch (error) {
    console.error("Logout Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Logout failed"
    );
  }
};
