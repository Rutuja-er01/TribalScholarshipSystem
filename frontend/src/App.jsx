import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetails from "./pages/ScholarshipDetails";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import DocumentChecklist from "./pages/DocumentChecklist";
import ApplicationGuide from "./pages/ApplicationGuide";
import MyApplications from "./pages/MyApplications";
import Admin from "./pages/Admin";

function App() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Keep the admin page separate from the student navigation.
  if (location.pathname === "/admin") {
    return <Admin />;
  }

  return (
    <div className="app">
      {/* Navigation Bar */}
      <header className="site-header">
        <nav className="navbar">
          <Link to="/" className="site-logo" onClick={closeMenu}>
            <span className="logo-icon">🌿</span>
            <span>TribalScholar</span>
          </Link>

          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <div
            id="main-navigation"
            className={`nav-links ${menuOpen ? "mobile-open" : ""}`}
          >
            <Link
              to="/"
              onClick={closeMenu}
              className={location.pathname === "/" ? "active" : ""}
            >
              Home
            </Link>

            <Link
              to="/scholarships"
              onClick={closeMenu}
              className={
                location.pathname.startsWith("/scholarships")
                  ? "active"
                  : ""
              }
            >
              Scholarships
            </Link>

            <Link
              to="/dashboard"
              onClick={closeMenu}
              className={location.pathname === "/dashboard" ? "active" : ""}
            >
              Dashboard
            </Link>

            <Link
              to="/my-applications"
              onClick={closeMenu}
              className={
                location.pathname === "/my-applications" ? "active" : ""
              }
            >
              My Applications
            </Link>

            <Link
              to="/profile"
              onClick={closeMenu}
              className={location.pathname === "/profile" ? "active" : ""}
            >
              Profile
            </Link>

            <Link
              to="/documents"
              onClick={closeMenu}
              className={location.pathname === "/documents" ? "active" : ""}
            >
              Document Checklist
            </Link>

            <Link
              to="/application-guide"
              onClick={closeMenu}
              className={
                location.pathname === "/application-guide" ? "active" : ""
              }
            >
              Application Guide
            </Link>

            <Link
              to="/about"
              onClick={closeMenu}
              className={location.pathname === "/about" ? "active" : ""}
            >
              About
            </Link>

            <Link
              to="/login"
              onClick={closeMenu}
              className={location.pathname === "/login" ? "active" : ""}
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={closeMenu}
              className={location.pathname === "/register" ? "active" : ""}
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Application Pages */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/scholarships" element={<Scholarships />} />

        <Route path="/scholarships/:id" element={<ScholarshipDetails />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/my-applications" element={<MyApplications />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/documents" element={<DocumentChecklist />} />

        <Route path="/application-guide" element={<ApplicationGuide />} />

        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<Admin />} />

        {/* Page Not Found */}
        <Route
          path="*"
          element={
            <main
              style={{
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
              <Link to="/">Return to Home</Link>
            </main>
          }
        />
      </Routes>

      {/* Footer */}
      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} TribalScholar.
          Supporting educational opportunities for tribal students.
        </p>
      </footer>
    </div>
  );
}

export default App;