
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../services/api";
import "./MyApplications.css";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your applications.");
        setLoading(false);
        return;
      }

      try {
        const data = await getMyApplications(token);
        setApplications(data);
      } catch (err) {
        setError(err.message || "Unable to load applications.");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  if (loading) {
    return (
      <main className="my-applications">
        <p className="applications-message">
          Loading your applications...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="my-applications">
        <h1>My Applications</h1>
        <p className="applications-error">{error}</p>
        <Link to="/login" className="applications-link">
          Go to Login
        </Link>
      </main>
    );
  }

  return (
    <main className="my-applications">
      <div className="applications-heading">
        <div>
          <p className="applications-eyebrow">STUDENT DASHBOARD</p>
          <h1>My Applications</h1>
          <p className="applications-subtitle">
            Track the scholarship applications you have submitted.
          </p>
        </div>

        <Link to="/scholarships" className="applications-back">
          Explore Scholarships
        </Link>
      </div>

      <div className="applications-summary">
        <div>
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
        </div>

        <div>
          <span>Submitted</span>
          <strong>
            {applications.filter(
              (app) => app.status === "Submitted"
            ).length}
          </strong>
        </div>
      </div>

      {applications.length === 0 ? (
        <section className="applications-empty">
          <h2>No applications yet</h2>
          <p>
            Explore available scholarships and submit your first application.
          </p>
          <Link to="/scholarships" className="applications-link">
            Browse Scholarships
          </Link>
        </section>
      ) : (
        <section className="applications-list">
          {applications.map((application) => (
            <article
              className="application-card"
              key={`${application.scholarship_id}-${application.submitted_at}`}
            >
              <div className="application-card-top">
                <div className="application-icon" aria-hidden="true">
                  🎓
                </div>

                <span
                  className={`application-status ${
                    application.status === "Submitted"
                      ? "status-submitted"
                      : ""
                  }`}
                >
                  {application.status || "Unknown"}
                </span>
              </div>

              <h2>{application.scholarship_name}</h2>

              <p className="application-detail">
                <strong>Scholarship ID:</strong>{" "}
                {application.scholarship_id}
              </p>

              <p className="application-detail">
                <strong>Submitted on:</strong>{" "}
                {application.submitted_at
                  ? new Date(
                      application.submitted_at
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Date unavailable"}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MyApplications;
