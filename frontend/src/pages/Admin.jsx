import { useState } from "react";
import {
  loginAdmin,
  getAllAdminApplications,
  updateAdminApplicationStatus,
} from "../services/api";
import "./Admin.css";

function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(
    () => sessionStorage.getItem("adminToken") || ""
  );
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadApplications(adminToken = token) {
    setLoading(true);
    setError("");

    try {
      const data = await getAllAdminApplications(adminToken);
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || "Could not load applications.");

      if (
        err.message?.toLowerCase().includes("token") ||
        err.message?.toLowerCase().includes("admin login")
      ) {
        sessionStorage.removeItem("adminToken");
        setToken("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginAdmin({ email, password });

      sessionStorage.setItem("adminToken", data.access_token);
      setToken(data.access_token);
      setPassword("");
      await loadApplications(data.access_token);
    } catch (err) {
      setError(err.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(applicationId, status) {
    setError("");
    setMessage("");

    try {
      await updateAdminApplicationStatus(applicationId, status, token);
      setMessage("Application status updated successfully.");
      await loadApplications(token);
    } catch (err) {
      setError(err.message || "Could not update application status.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("adminToken");
    setToken("");
    setApplications([]);
    setEmail("");
    setPassword("");
    setError("");
    setMessage("");
  }

  if (!token) {
    return (
      <main className="admin-page">
        <section className="admin-login-card">
          <div className="admin-icon">🎓</div>
          <h1>Admin Login</h1>
          <p>Tribal Scholarship System</p>

          {error && <div className="admin-alert error">{error}</div>}

          <form onSubmit={handleLogin}>
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter admin email"
              autoComplete="username"
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login as Admin"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-dashboard">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>Scholarship Dashboard</h1>
            <p>Manage student scholarship applications.</p>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <div className="admin-summary">
          <div className="admin-stat">
            <span>Total Applications</span>
            <strong>{applications.length}</strong>
          </div>
          <div className="admin-stat">
            <span>Submitted</span>
            <strong>
              {applications.filter((app) => app.status === "Submitted").length}
            </strong>
          </div>
          <div className="admin-stat">
            <span>Under Review</span>
            <strong>
              {applications.filter((app) => app.status === "Under Review").length}
            </strong>
          </div>
          <div className="admin-stat">
            <span>Approved</span>
            <strong>
              {applications.filter((app) => app.status === "Approved").length}
            </strong>
          </div>
        </div>

        {error && <div className="admin-alert error">{error}</div>}
        {message && <div className="admin-alert success">{message}</div>}

        <div className="admin-table-heading">
          <div>
            <h2>Student Applications</h2>
            <p>Review applications and update their status.</p>
          </div>

          <button
            type="button"
            className="admin-refresh"
            onClick={() => loadApplications()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading && applications.length === 0 ? (
          <p className="admin-empty">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="admin-empty">No applications found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student Email</th>
                  <th>Scholarship</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((app) => (
                  <tr key={app.application_id}>
                    <td>{app.student_email}</td>
                    <td>{app.scholarship_name}</td>
                    <td>
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={app.status}
                        onChange={(event) =>
                          handleStatusChange(
                            app.application_id,
                            event.target.value
                          )
                        }
                        aria-label={`Status for ${app.scholarship_name}`}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;