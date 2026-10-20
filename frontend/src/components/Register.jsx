
import { useState } from "react";
import { UserRound, Mail, Lock, AtSign } from "lucide-react";
import { registerUser } from "../services/authService";
import "./Auth.css";

function Register({ onShowLogin }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password kamit kami 8 characters cha pahije.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess("Account created successfully! Please login.");

      setTimeout(() => {
        onShowLogin(form.email.trim());
      }, 700);
    } catch (err) {
      setError(err.message || "Account create zala nahi.");
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

        <h2>Create Account</h2>
        <p className="auth-subtitle">
          Join the community and share your passion.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <div className="auth-input-wrapper">
            <UserRound size={18} />
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          <label>Username</label>
          <div className="auth-input-wrapper">
            <AtSign size={18} />
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
          </div>

          <label>Email</label>
          <div className="auth-input-wrapper">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
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
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={() => onShowLogin()}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
