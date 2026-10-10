
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import scholarshipData from "../scholarshipData";

const emptyProfile = {
  name: "",
  email: "",
  state: "",
  category: "ST",
  education: "",
  course: "",
  institution: "",
  familyIncome: "",
};

const statusOptions = [
  "Not Applied",
  "Applied",
  "Under Review",
  "Approved",
  "Rejected",
];

function readArrayFromStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDeadlineInfo(deadline) {
  if (!deadline) {
    return { text: "Deadline not added", type: "no-deadline" };
  }

  const parts = deadline.split("-").map(Number);
  const deadlineDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.round(
    (deadlineDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) {
    return { text: "Deadline expired", type: "expired" };
  }

  if (daysLeft === 0) {
    return { text: "Deadline is today!", type: "urgent" };
  }

  if (daysLeft <= 7) {
    return {
      text: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
      type: "urgent",
    };
  }

  return {
    text: `${daysLeft} days left`,
    type: "upcoming",
  };
}

function Dashboard() {
  const [profile, setProfile] = useState(emptyProfile);
  const [applications, setApplications] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [checkedDocuments, setCheckedDocuments] = useState([]);
  const [completedGuideSteps, setCompletedGuideSteps] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [selectedScholarship, setSelectedScholarship] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Not Applied");
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [message, setMessage] = useState("");

  // Load saved information from the browser.
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("tribalStudentProfile");
      const savedApplications = localStorage.getItem(
        "tribalScholarshipApplications"
      );

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);

        if (
          parsedProfile &&
          typeof parsedProfile === "object" &&
          !Array.isArray(parsedProfile)
        ) {
          setProfile({
            ...emptyProfile,
            ...parsedProfile,
          });
        }
      }

      if (savedApplications) {
        const parsedApplications = JSON.parse(savedApplications);

        if (Array.isArray(parsedApplications)) {
          setApplications(parsedApplications);
        }
      }

      setSavedScholarships(readArrayFromStorage("savedScholarships"));
      setCheckedDocuments(
        readArrayFromStorage("tribalDocumentChecklist")
      );
      setCompletedGuideSteps(
        readArrayFromStorage("tribalApplicationGuide")
      );
    } catch (error) {
      console.error("Unable to load dashboard data:", error);
      setMessage("Could not load some saved data.");
    } finally {
      setDataLoaded(true);
    }
  }, []);

  // Save tracker information whenever it changes.
  useEffect(() => {
    if (!dataLoaded) return;

    try {
      localStorage.setItem(
        "tribalScholarshipApplications",
        JSON.stringify(applications)
      );
    } catch (error) {
      console.error("Unable to save applications:", error);
      setMessage("Could not save applications. Check browser storage.");
    }
  }, [applications, dataLoaded]);

  // Handle profile input changes.
  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  // Save student profile.
  const saveProfile = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(
        "tribalStudentProfile",
        JSON.stringify(profile)
      );
      setMessage("Profile saved successfully!");
    } catch (error) {
      console.error("Unable to save profile:", error);
      setMessage("Could not save your profile.");
    }
  };

  // Add a scholarship while preventing duplicates.
  const addApplication = (event) => {
    event.preventDefault();

    if (!selectedScholarship) {
      setMessage("Please select a scholarship.");
      return;
    }

    const scholarship = scholarshipData.find(
      (item) => String(item.id) === String(selectedScholarship)
    );

    if (!scholarship) {
      setMessage("Selected scholarship could not be found.");
      return;
    }

    // Check both scholarship ID and older entries without an ID.
    const alreadyAdded = applications.some((item) => {
      if (item.scholarshipId != null) {
        return (
          String(item.scholarshipId) === String(scholarship.id)
        );
      }

      return (
        item.name?.trim().toLowerCase() ===
        scholarship.name?.trim().toLowerCase()
      );
    });

    if (alreadyAdded) {
      window.alert("This scholarship is already in your tracker!");
      setMessage("This scholarship is already in your tracker.");
      return;
    }

    const newApplication = {
      id: Date.now(),
      scholarshipId: scholarship.id,
      name: scholarship.name,
      portal: scholarship.provider ?? "",
      link: scholarship.link ?? "",
      status: selectedStatus,
      deadline: selectedDeadline,
    };

    setApplications((previous) => [...previous, newApplication]);

    setSelectedScholarship("");
    setSelectedStatus("Not Applied");
    setSelectedDeadline("");
    setMessage("Scholarship added to your tracker!");
  };

  // Update application status.
  const updateStatus = (applicationId, newStatus) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId
          ? { ...application, status: newStatus }
          : application
      )
    );

    setMessage("Application status updated.");
  };

  // Update scholarship deadline.
  const updateDeadline = (applicationId, newDeadline) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === applicationId
          ? { ...application, deadline: newDeadline }
          : application
      )
    );

    setMessage("Deadline saved successfully.");
  };

  // Remove an application from the tracker.
  const removeApplication = (applicationId) => {
    setApplications((previous) =>
      previous.filter((application) => application.id !== applicationId)
    );

    setMessage("Application removed.");
  };

  const trackedCount = applications.length;

  const appliedCount = applications.filter(
    (application) => application.status !== "Not Applied"
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  const urgentCount = applications.filter((application) => {
    if (!application.deadline) return false;
    return getDeadlineInfo(application.deadline).type === "urgent";
  }).length;

  const upcomingCount = applications.filter((application) => {
    if (!application.deadline) return false;
    return getDeadlineInfo(application.deadline).type === "upcoming";
  }).length;

  const savedIds = new Set(
    savedScholarships
      .map((item) => {
        if (item && typeof item === "object") {
          return Number(item.id ?? item.scholarshipId);
        }
        return Number(item);
      })
      .filter(Number.isFinite)
  );

  const savedScholarshipItems = scholarshipData.filter((scholarship) =>
    savedIds.has(Number(scholarship.id))
  );

  const documentTotal = 8;
  const guideTotal = 6;

  const documentCount = Math.min(
    new Set(checkedDocuments).size,
    documentTotal
  );

  const guideCount = Math.min(
    new Set(completedGuideSteps).size,
    guideTotal
  );

  const documentPercent = Math.round(
    (documentCount / documentTotal) * 100
  );

  const guidePercent = Math.round(
    (guideCount / guideTotal) * 100
  );

  if (!dataLoaded) {
    return (
      <main className="dashboard-page">
        <p>Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      {/* Dashboard heading */}
      <section className="dashboard-heading">
        <p className="dashboard-eyebrow">STUDENT DASHBOARD</p>
        <h1>
          Welcome
          {profile.name.trim() ? `, ${profile.name.trim()}` : ""}! 🌿
        </h1>
        <p>
          Manage your profile, saved scholarships, documents, applications,
          and deadlines in one place.
        </p>
      </section>

      {/* Feedback message */}
      {message && (
        <div className="dashboard-message" role="status" aria-live="polite">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Dashboard summary */}
      <section className="dashboard-summary">
        <article className="summary-card">
          <span className="summary-icon">📚</span>
          <div>
            <p>Tracked Scholarships</p>
            <h2>{trackedCount}</h2>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon">📝</span>
          <div>
            <p>Applications Started</p>
            <h2>{appliedCount}</h2>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon">🎓</span>
          <div>
            <p>Approved Applications</p>
            <h2>{approvedCount}</h2>
          </div>
        </article>

        <article className="summary-card">
          <span className="summary-icon">⏰</span>
          <div>
            <p>Deadlines Within 7 Days</p>
            <h2>{urgentCount}</h2>
          </div>
        </article>
      </section>

      {/* Scholarship journey */}
      <section className="dashboard-card journey-section">
        <div className="section-heading">
          <span>🌱</span>
          <div>
            <h2>Your Scholarship Journey</h2>
            <p>Continue from where you left off.</p>
          </div>
        </div>

        <div className="journey-grid">
          <article className="journey-card">
            <span className="journey-icon">⭐</span>
            <h3>Saved Scholarships</h3>
            <p className="journey-number">{savedScholarshipItems.length}</p>
            <p>Scholarships saved for later.</p>
            <Link to="/scholarships" className="journey-link">
              Explore scholarships →
            </Link>
          </article>

          <article className="journey-card">
            <span className="journey-icon">📄</span>
            <h3>Document Checklist</h3>
            <p className="journey-number">
              {documentCount}/{documentTotal}
            </p>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Document checklist progress"
              aria-valuenow={documentPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-fill"
                style={{ width: `${documentPercent}%` }}
              />
            </div>
            <p>{documentPercent}% completed</p>
            <Link to="/documents" className="journey-link">
              Check your documents →
            </Link>
          </article>

          <article className="journey-card">
            <span className="journey-icon">🧭</span>
            <h3>Application Guide</h3>
            <p className="journey-number">
              {guideCount}/{guideTotal}
            </p>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Application guide progress"
              aria-valuenow={guidePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-fill"
                style={{ width: `${guidePercent}%` }}
              />
            </div>
            <p>{guidePercent}% completed</p>
            <Link to="/application-guide" className="journey-link">
              Continue the guide →
            </Link>
          </article>
        </div>

        {savedScholarshipItems.length > 0 && (
          <div className="saved-scholarships-list">
            <h3>Your Saved Scholarships</h3>
            {savedScholarshipItems.map((scholarship) => (
              <div className="saved-scholarship-item" key={scholarship.id}>
                <span>🎓 {scholarship.name}</span>
                <Link to={`/scholarships/${scholarship.id}`}>
                  View details →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="journey-quick-links">
          <Link to="/scholarships">Browse Scholarships</Link>
          <Link to="/documents">Document Checklist</Link>
          <Link to="/application-guide">Application Guide</Link>
        </div>
      </section>

      {/* Student profile */}
      <section className="dashboard-card">
        <div className="section-heading">
          <span>👤</span>
          <div>
            <h2>Student Profile</h2>
            <p>Your profile details are shared with the Profile page.</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              placeholder="Enter your full name"
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            State
            <input
              type="text"
              name="state"
              value={profile.state}
              onChange={handleProfileChange}
              placeholder="Enter your state"
              required
            />
          </label>

          <label>
            Student Category
            <select
              name="category"
              value={profile.category}
              onChange={handleProfileChange}
              required
            >
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>

          <label>
            Education Level
            <select
              name="education"
              value={profile.education}
              onChange={handleProfileChange}
              required
            >
              <option value="">Select education level</option>
              <option value="School">School</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Course / Class
            <input
              type="text"
              name="course"
              value={profile.course}
              onChange={handleProfileChange}
              placeholder="e.g. B.Tech Computer Engineering"
              required
            />
          </label>

          <label>
            School or College
            <input
              type="text"
              name="institution"
              value={profile.institution}
              onChange={handleProfileChange}
              placeholder="Enter your institution"
            />
          </label>

          <label>
            Annual Family Income (₹)
            <input
              type="number"
              name="familyIncome"
              min="0"
              value={profile.familyIncome}
              onChange={handleProfileChange}
              placeholder="Enter annual family income"
              required
            />
          </label>

          <button className="primary-button" type="submit">
            Save Profile
          </button>
        </form>
      </section>

      {/* Scholarship deadline tracker */}
      <section className="dashboard-card">
        <div className="section-heading">
          <span>📅</span>
          <div>
            <h2>Scholarship Deadline Tracker</h2>
            <p>
              Enter the deadline shown on the official scholarship portal.
            </p>
          </div>
        </div>

        <form className="tracker-form" onSubmit={addApplication}>
          <label>
            Select Scholarship
            <select
              value={selectedScholarship}
              onChange={(event) =>
                setSelectedScholarship(event.target.value)
              }
              required
            >
              <option value="">Choose a scholarship</option>
              {scholarshipData.map((scholarship) => (
                <option key={scholarship.id} value={scholarship.id}>
                  {scholarship.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Application Status
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Deadline (optional)
            <input
              type="date"
              value={selectedDeadline}
              onChange={(event) =>
                setSelectedDeadline(event.target.value)
              }
            />
          </label>

          <button className="primary-button" type="submit">
            + Add to Tracker
          </button>
        </form>

        <div className="deadline-summary">
          <span>📌 {upcomingCount} upcoming</span>
          <span>⚠️ {urgentCount} due within 7 days</span>
        </div>

        <div className="application-list">
          {applications.length === 0 ? (
            <div className="empty-tracker">
              <p>No scholarships in your tracker yet.</p>
              <p>Add a scholarship above to track its status and deadline.</p>
            </div>
          ) : (
            applications.map((application) => {
              const deadlineInfo = getDeadlineInfo(application.deadline);

              return (
                <article
                  className="application-card"
                  key={application.id}
                >
                  <div className="application-details">
                    <h3>{application.name}</h3>
                    <p>{application.portal}</p>
                    <p className={`deadline-badge ${deadlineInfo.type}`}>
                      {deadlineInfo.text}
                    </p>

                    <label>
                      Update Deadline
                      <input
                        type="date"
                        value={application.deadline || ""}
                        onChange={(event) =>
                          updateDeadline(
                            application.id,
                            event.target.value
                          )
                        }
                      />
                    </label>

                    {application.link && (
                      <a
                        href={application.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit official portal ↗
                      </a>
                    )}
                  </div>

                  <div className="application-actions">
                    <label>
                      Application Status
                      <select
                        className="status-select"
                        value={application.status}
                        onChange={(event) =>
                          updateStatus(
                            application.id,
                            event.target.value
                          )
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      className="remove-button"
                      type="button"
                      onClick={() => removeApplication(application.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <p className="dashboard-note">
        Scholarship information and deadlines must be verified on official
        portals. Application statuses are manually tracked and are not
        verified by the government. Your data is currently stored in this
        browser.
      </p>
    </main>
  );
}

export default Dashboard;
