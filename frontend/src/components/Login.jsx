
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
    setError("");
    setLoading(true);

    try {
      const user = await loginUser({
        email: email.trim(),
        password,
      });

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
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
          <label>Email Address</label>
          <div className="auth-input-wrapper">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input-wrapper">
            <Lock size={18} />
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

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
          <button type="button" onClick={onShowRegister}>
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
