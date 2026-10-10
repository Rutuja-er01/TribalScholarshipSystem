
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function getPasswordStrength(password) {
  if (!password) {
    return { label: "", level: 0 };
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", level: 1 };
  if (score <= 3) return { label: "Medium", level: 2 };

  return { label: "Strong", level: 3 };
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  const strength = getPasswordStrength(password);

  const handleRegister = (event) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    setMessage(
      "Registration page is ready. Backend account creation will be added later."
    );
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon">🌱</div>

        <p className="auth-eyebrow">START YOUR JOURNEY</p>
        <h1>Create Your Account</h1>

        <p className="auth-description">
          Discover educational opportunities designed for tribal students.
        </p>

        {message && (
          <div className="auth-message" role="status">
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleRegister}>
          <label htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>

          <div className="password-wrapper">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password (8+ characters)"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {password && (
            <div className="password-strength" aria-live="polite">
              <div className="strength-bars">
                {[1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={
                      bar <= strength.level
                        ? `strength-bar strength-level-${strength.level}`
                        : "strength-bar"
                    }
                  />
                ))}
              </div>

              <p>
                Password strength:{" "}
                <strong className={`strength-text level-${strength.level}`}>
                  {strength.label}
                </strong>
              </p>

              <small>
                Use 8+ characters with uppercase and lowercase letters,
                numbers, and symbols.
              </small>
            </div>
          )}

          <label htmlFor="confirm-password">Confirm Password</label>

          <div className="password-wrapper">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setMessage("");
              }}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="auth-button" type="submit">
            Create Account
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Login here</Link>
        </p>

        <Link to="/" className="auth-home-link">
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}

export default Register;
