
import { useEffect, useState } from "react";
import scholarshipData from "../scholarshipData";
import "./Scholarships.css";

const emptyProfile = {
  name: "",
  email: "",
  state: "",
  category: "ST",
  education: "",
  educationLevel: "",
  course: "",
  institution: "",
  familyIncome: "",
  annualIncome: "",
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

// Connect education values from Dashboard and Scholarship Finder.
function getEducationLevel(profile) {
  const level =
    profile.educationLevel || profile.education || profile.level || "";

  const levelMap = {
    Diploma: "College",
    Undergraduate: "College",
    Postgraduate: "College",
    Other: "",
  };

  return levelMap[level] ?? level;
}

function Scholarships() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [portalFilter, setPortalFilter] = useState("All");
  const [showMatches, setShowMatches] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [savedScholarships, setSavedScholarships] = useState(() => {
    const saved = readStorage("savedScholarships", []);
    return Array.isArray(saved) ? saved : [];
  });

  const [studentProfile, setStudentProfile] = useState(() =>
    readStorage("tribalStudentProfile", emptyProfile)
  );

  const [studentLevel, setStudentLevel] = useState("");
  const [studentState, setStudentState] = useState("");
  const [studentCategory, setStudentCategory] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentIncome, setStudentIncome] = useState("");

  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [message, setMessage] = useState("");

  // Load the shared profile saved by Dashboard or Profile page.
  useEffect(() => {
    const storedProfile = readStorage(
      "tribalStudentProfile",
      emptyProfile
    );

    const profile =
      storedProfile &&
      typeof storedProfile === "object" &&
      !Array.isArray(storedProfile)
        ? { ...emptyProfile, ...storedProfile }
        : { ...emptyProfile };

    setStudentProfile(profile);
    setStudentLevel(getEducationLevel(profile));
    setStudentState(profile.state || "");
    setStudentCategory(profile.category || "");
    setStudentCourse(profile.course || "");
    setStudentIncome(
      profile.annualIncome ??
        profile.familyIncome ??
        profile.income ??
        ""
    );
  }, []);

  // Keep saved scholarships in browser storage.
  useEffect(() => {
    try {
      localStorage.setItem(
        "savedScholarships",
        JSON.stringify(savedScholarships)
      );
    } catch {
      setMessage("Unable to save scholarships in this browser.");
    }
  }, [savedScholarships]);

  // Calculate a profile match using available education, state and category.
  const getMatchPercentage = (item) => {
    let score = 0;
    let total = 0;

    if (studentLevel) {
      total++;
      if (
        item.level === studentLevel ||
        item.level === "All Levels"
      ) {
        score++;
      }
    }

    if (studentState) {
      total++;
      if (item.state === studentState || item.state === "All") {
        score++;
      }
    }

    if (studentCategory) {
      total++;
      if (
        item.category === studentCategory ||
        item.category === "All"
      ) {
        score++;
      }
    }

    return total === 0 ? 0 : Math.round((score / total) * 100);
  };

  // Explain matching fields and criteria that students must verify.
  const getMatchReasons = (item) => {
    const reasons = [];

    if (studentLevel) {
      if (
        item.level === studentLevel ||
        item.level === "All Levels"
      ) {
        reasons.push({
          text: "Your selected education level matches this listing.",
          type: "match",
        });
      } else {
        reasons.push({
          text: "Your education level may not match. Check the official scheme rules.",
          type: "warning",
        });
      }
    }

    if (studentState) {
      if (item.state === studentState || item.state === "All") {
        reasons.push({
          text: "Your selected state matches this listing.",
          type: "match",
        });
      } else {
        reasons.push({
          text: "This listing may not apply to your state. Verify state and domicile requirements.",
          type: "warning",
        });
      }
    }

    if (studentCategory) {
      if (
        item.category === studentCategory ||
        item.category === "All"
      ) {
        reasons.push({
          text: "Your selected category matches this listing.",
          type: "match",
        });
      } else {
        reasons.push({
          text: "Your category may not match. Check the scheme's official criteria.",
          type: "warning",
        });
      }
    }

    if (studentCourse.trim()) {
      reasons.push({
        text: `Verify whether ${studentCourse.trim()} is an eligible course under this scheme.`,
        type: "verify",
      });
    } else {
      reasons.push({
        text: "Check whether your course is eligible before applying.",
        type: "verify",
      });
    }

    if (studentIncome !== "") {
      const income = Number(studentIncome);

      if (Number.isFinite(income) && income >= 0) {
        reasons.push({
          text: `Your entered annual family income is ₹${income.toLocaleString("en-IN")}. Compare it with the scheme's official income limit.`,
          type: "verify",
        });
      } else {
        reasons.push({
          text: "Enter a valid annual family income and check the official income criteria.",
          type: "warning",
        });
      }
    } else {
      reasons.push({
        text: "Check the scheme's income limit and your family's eligibility.",
        type: "verify",
      });
    }

    reasons.push({
      text: "Confirm required documents, application dates and final eligibility on the official portal.",
      type: "verify",
    });

    return reasons;
  };

  const clearFilters = () => {
    setSearch("");
    setLevelFilter("All");
    setPortalFilter("All");
    setShowMatches(false);
    setShowSavedOnly(false);
    setMessage("");
  };

  // Save or remove a scholarship by its ID.
  const toggleSaved = (item) => {
    const alreadySaved = savedScholarships.some(
      (saved) => Number(saved?.id ?? saved?.scholarshipId ?? saved) === Number(item.id)
    );

    if (alreadySaved) {
      setSavedScholarships((previous) =>
        previous.filter(
          (saved) =>
            Number(saved?.id ?? saved?.scholarshipId ?? saved) !==
            Number(item.id)
        )
      );
      setMessage("Scholarship removed from saved list.");
    } else {
      setSavedScholarships((previous) => [...previous, item]);
      setMessage("Scholarship saved successfully!");
    }
  };

  const isSaved = (item) =>
    savedScholarships.some(
      (saved) =>
        Number(saved?.id ?? saved?.scholarshipId ?? saved) ===
        Number(item.id)
    );

  // Save profile without deleting Dashboard-only fields.
  const handleProfileSave = (event) => {
    event.preventDefault();

    const profile = {
      ...studentProfile,
      educationLevel: studentLevel,
      state: studentState,
      category: studentCategory,
      course: studentCourse.trim(),
      annualIncome: studentIncome,
      education: studentProfile.education || studentLevel,
      familyIncome: studentIncome,
    };

    try {
      localStorage.setItem(
        "tribalStudentProfile",
        JSON.stringify(profile)
      );

      setStudentProfile(profile);
      setShowMatches(true);
      setShowSavedOnly(false);
      setMessage(
        "Student profile saved. Showing matching scholarships."
      );
    } catch {
      setMessage("Unable to save your profile in this browser.");
    }
  };

  // Apply search, filters, saved-only mode and profile matching.
  const filteredScholarships = scholarshipData.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchText) ||
      (item.provider || "").toLowerCase().includes(searchText) ||
      (item.description || "").toLowerCase().includes(searchText);

    const matchesLevel =
      levelFilter === "All" ||
      item.level === levelFilter ||
      item.level === "All Levels";

    const matchesPortal =
      portalFilter === "All" || item.portalType === portalFilter;

    const matchesStudentLevel =
      !studentLevel ||
      item.level === studentLevel ||
      item.level === "All Levels";

    const matchesStudentState =
      !studentState ||
      item.state === studentState ||
      item.state === "All";

    const matchesStudentCategory =
      !studentCategory ||
      item.category === studentCategory ||
      item.category === "All";

    const matchesProfile =
      matchesStudentLevel &&
      matchesStudentState &&
      matchesStudentCategory;

    const matchesSaved =
      !showSavedOnly ||
      savedScholarships.some(
        (saved) =>
          Number(saved?.id ?? saved?.scholarshipId ?? saved) ===
          Number(item.id)
      );

    const matchesStudent = !showMatches || matchesProfile;

    return (
      matchesSearch &&
      matchesLevel &&
      matchesPortal &&
      matchesStudent &&
      matchesSaved
    );
  });

  return (
    <div className="scholarships-page">
      <section className="scholarships-hero">
        <h1>Find Scholarships</h1>
        <p>
          Explore scholarship opportunities and discover options
          that may suit your education and profile.
        </p>

        <input
          type="text"
          placeholder="Search scholarships..."
          aria-label="Search scholarships"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      <section className="student-profile-section">
        <h2>Find Scholarships for Me</h2>
        <p>
          Enter your details to find scholarships that match your
          selected profile.
        </p>

        <form onSubmit={handleProfileSave}>
          <div className="profile-form-grid">
            <div>
              <label htmlFor="educationLevel">Education Level</label>
              <select
                id="educationLevel"
                value={studentLevel}
                onChange={(event) => setStudentLevel(event.target.value)}
              >
                <option value="">Select education level</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label htmlFor="studentState">State</label>
              <select
                id="studentState"
                value={studentState}
                onChange={(event) => setStudentState(event.target.value)}
              >
                <option value="">Select state</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="All">All States</option>
              </select>
            </div>

            <div>
              <label htmlFor="studentCategory">Category</label>
              <select
                id="studentCategory"
                value={studentCategory}
                onChange={(event) =>
                  setStudentCategory(event.target.value)
                }
              >
                <option value="">Select category</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="All">All Categories</option>
              </select>
            </div>

            <div>
              <label htmlFor="studentCourse">Course</label>
              <input
                id="studentCourse"
                type="text"
                placeholder="e.g. B.Tech"
                value={studentCourse}
                onChange={(event) => setStudentCourse(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="studentIncome">
                Annual Family Income (₹)
              </label>
              <input
                id="studentIncome"
                type="number"
                min="0"
                step="any"
                placeholder="Enter annual income"
                value={studentIncome}
                onChange={(event) => setStudentIncome(event.target.value)}
              />
            </div>
          </div>

          <button type="submit">Find Matching Scholarships</button>
        </form>
      </section>

      <section className="scholarship-filters">
        <h2>Explore Opportunities</h2>

        <div className="filter-controls">
          <div>
            <label htmlFor="levelFilter">Education Level</label>
            <select
              id="levelFilter"
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
            >
              <option value="All">All Levels</option>
              <option value="School">School</option>
              <option value="College">College</option>
            </select>
          </div>

          <div>
            <label htmlFor="portalFilter">Portal Type</label>
            <select
              id="portalFilter"
              value={portalFilter}
              onChange={(event) => setPortalFilter(event.target.value)}
            >
              <option value="All">All Portals</option>
              <option value="National">National</option>
              <option value="State">State</option>
            </select>
          </div>

          <button type="button" onClick={clearFilters}>
            Clear Filters
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSavedOnly((previous) => !previous);
              setShowMatches(false);
              setMessage("");
            }}
          >
            {showSavedOnly ? "Show All Scholarships" : "Saved Scholarships"} (
            {savedScholarships.length})
          </button>
        </div>

        {message && <p role="status">{message}</p>}

        <p>
          Showing {filteredScholarships.length} scholarship
          {filteredScholarships.length === 1 ? "" : "s"}.
        </p>

        <div className="scholarship-grid">
          {filteredScholarships.map((item) => {
            const percentage = getMatchPercentage(item);
            const reasons = getMatchReasons(item);

            return (
              <article className="scholarship-card" key={item.id}>
                <div className="scholarship-card-header">
                  <span className="scholarship-provider">
                    {item.provider}
                  </span>
                  <span className="scholarship-level">{item.level}</span>
                </div>

                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="match-percentage">
                  <div className="match-percentage-heading">
                    <span>Profile Match</span>
                    <strong>{percentage}%</strong>
                  </div>

                  <div
                    className="match-progress-track"
                    role="progressbar"
                    aria-label="Profile match percentage"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage}
                  >
                    <div
                      className="match-progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <small>
                    Based on selected education level, state and category.
                    This is not confirmation of eligibility.
                  </small>
                </div>

                <div className="match-reasons">
                  <h4>Match Details</h4>
                  <ul>
                    {reasons.map((reason, index) => (
                      <li
                        key={`${item.id}-${index}`}
                        className={`match-reason ${reason.type}`}
                      >
                        {reason.type === "match"
                          ? "✓ "
                          : reason.type === "warning"
                            ? "⚠ "
                            : "ℹ "}
                        {reason.text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="scholarship-card-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedScholarship(item)}
                  >
                    View Details
                  </button>
                  <button type="button" onClick={() => toggleSaved(item)}>
                    {isSaved(item) ? "Remove Saved" : "Save Scholarship"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="no-scholarships">
            <h3>No scholarships found</h3>
            <p>
              Try changing your search or filters to see more opportunities.
            </p>
            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {selectedScholarship && (
        <div
          className="scholarship-modal-overlay"
          onClick={() => setSelectedScholarship(null)}
        >
          <div
            className="scholarship-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scholarship-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close details"
              onClick={() => setSelectedScholarship(null)}
            >
              ×
            </button>

            <h2 id="scholarship-modal-title">
              {selectedScholarship.name}
            </h2>

            <p>
              <strong>Provider:</strong> {selectedScholarship.provider}
            </p>
            <p>
              <strong>Education Level:</strong> {selectedScholarship.level}
            </p>
            <p>
              <strong>State:</strong> {selectedScholarship.state}
            </p>
            <p>
              <strong>Category:</strong> {selectedScholarship.category}
            </p>
            <p>
              <strong>Description:</strong> {selectedScholarship.description}
            </p>
            <p>
              <strong>Eligibility:</strong> {selectedScholarship.eligibility}
            </p>
            <p>
              <strong>Deadline:</strong> {selectedScholarship.deadline}
            </p>
            <p>
              <strong>Profile Match:</strong>{" "}
              {getMatchPercentage(selectedScholarship)}%
            </p>

            <p>
              Confirm current eligibility, deadlines and required documents
              on the official portal before applying.
            </p>

            <div className="scholarship-card-actions">
              {selectedScholarship.link && (
                <a
                  className="details-button official-portal-link"
                  href={selectedScholarship.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Official Portal
                </a>
              )}

              <button
                type="button"
                onClick={() => toggleSaved(selectedScholarship)}
              >
                {isSaved(selectedScholarship)
                  ? "Remove Saved"
                  : "Save Scholarship"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scholarships;
