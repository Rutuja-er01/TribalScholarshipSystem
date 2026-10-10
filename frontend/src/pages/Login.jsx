import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginStudent } from "../services/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(
    location.state?.message || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      setIsLoading(true);

      const data = await loginStudent({
        email: email.trim(),
        password,
      });

      // Save the authentication token for future API requests.
      localStorage.setItem("token", data.access_token);

      // Save basic student details for use in the frontend.
      localStorage.setItem(
        "student",
        JSON.stringify({
          name: data.name,
          email: data.email,
        })
      );

      // Navigate to the home page after successful login.
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(
        error.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon">🌿</div>

        <p className="auth-eyebrow">WELCOME BACK</p>
        <h1>Login to TribalScholar</h1>

        <p className="auth-description">
          Sign in to explore scholarships and manage your applications.
        </p>

        {message && (
          <div className="auth-message" role="status">
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="login-email">Email Address</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setMessage("");
            }}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <div className="password-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>

        <Link to="/" className="auth-home-link">
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}

export default Login;