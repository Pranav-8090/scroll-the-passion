import { useEffect, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { loginUser } from "../services/authService";
import "./Auth.css";

function Login({
  initialEmail = "",
  onLoginSuccess,
  onShowRegister,
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(initialEmail || "");
  }, [initialEmail]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const user = await loginUser({
        email: email.trim(),
        password,
      });

      if (!user) {
        throw new Error("Login response is empty. Please try again.");
      }

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(user);
      } else {
        setError("Login succeeded, but the next page could not be opened.");
      }
    } catch (err) {
      console.error("Login Error:", err);

      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail;

      if (!err.response) {
        setError(
          "Cannot connect to the server. Please check your internet connection and try again."
        );
      } else if (err.response.status === 401) {
        setError(
          serverMessage ||
            "Login failed. Your email, password, or authentication may be incorrect."
        );
      } else if (err.response.status === 403) {
        setError(
          serverMessage ||
            "Access denied. Please log in again and try once more."
        );
      } else {
        setError(
          serverMessage ||
            `Login failed (Error ${err.response.status}). Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">S</div>
          <h1>Scroll The Passion</h1>
          <p>Learn · Create · Grow</p>
        </div>

        <h2>Welcome Back!</h2>

        <p className="auth-subtitle">
          Login to continue your journey.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>

          <div className="auth-input-wrapper">
            <Mail size={18} />

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <label htmlFor="login-password">Password</label>

          <div className="auth-input-wrapper">
            <Lock size={18} />

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onShowRegister}
            disabled={loading}
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;