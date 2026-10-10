
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

function getIncomeStatus(item, studentIncome) {
  const incomeText = String(studentIncome).trim();
  const income = Number(incomeText);

  const hasIncome =
    incomeText !== "" &&
    Number.isFinite(income) &&
    income >= 0;

  const hasMaximumIncome = Number.isFinite(item.incomeLimit);
  const hasMinimumIncome = Number.isFinite(item.minimumIncome);

  if (!hasIncome || (!hasMaximumIncome && !hasMinimumIncome)) {
    return "unknown";
  }

  const meetsMaximum =
    !hasMaximumIncome || income <= item.incomeLimit;

  const meetsMinimum =
    !hasMinimumIncome || income > item.minimumIncome;

  return meetsMaximum && meetsMinimum ? "match" : "mismatch";
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

  const [studentProfile, setStudentProfile] = useState(() => {
    const saved = readStorage("tribalStudentProfile", emptyProfile);

    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? { ...emptyProfile, ...saved }
      : { ...emptyProfile };
  });

  const [studentLevel, setStudentLevel] = useState("");
  const [studentState, setStudentState] = useState("");
  const [studentCategory, setStudentCategory] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentIncome, setStudentIncome] = useState("");

  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStudentLevel(getEducationLevel(studentProfile));
    setStudentState(studentProfile.state || "");
    setStudentCategory(studentProfile.category || "");
    setStudentCourse(studentProfile.course || "");
    setStudentIncome(
      studentProfile.annualIncome ??
        studentProfile.familyIncome ??
        studentProfile.income ??
        ""
    );
  }, []);

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

  // Calculate a match percentage using only assessable criteria.
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

    if (
      studentCourse.trim() &&
      Array.isArray(item.eligibleCourses) &&
      item.eligibleCourses.length > 0
    ) {
      total++;

      const courseMatches = item.eligibleCourses.some(
        (course) =>
          typeof course === "string" &&
          course.toLowerCase() === studentCourse.trim().toLowerCase()
      );

      if (courseMatches) score++;
    }

    const incomeStatus = getIncomeStatus(item, studentIncome);

    if (incomeStatus !== "unknown") {
      total++;
      if (incomeStatus === "match") score++;
    }

    return total === 0 ? null : Math.round((score / total) * 100);
  };

  // Explain known matches, mismatches and unknown criteria.
  const getMatchReasons = (item) => {
    const reasons = [];

    if (studentLevel) {
      const matches =
        item.level === studentLevel ||
        item.level === "All Levels";

      reasons.push({
        type: matches ? "match" : "warning",
        text: matches
          ? "Education level matches."
          : "Education level may not match; check the official rules.",
      });
    }

    if (studentState) {
      const matches =
        item.state === studentState || item.state === "All";

      reasons.push({
        type: matches ? "match" : "warning",
        text: matches
          ? "State matches this listing."
          : "Check state and domicile requirements.",
      });
    }

    if (studentCategory) {
      const matches =
        item.category === studentCategory ||
        item.category === "All";

      reasons.push({
        type: matches ? "match" : "warning",
        text: matches
          ? "Category matches this listing."
          : "Category may not match the scheme.",
      });
    }

    if (studentCourse.trim()) {
      if (
        Array.isArray(item.eligibleCourses) &&
        item.eligibleCourses.length > 0
      ) {
        const courseMatches = item.eligibleCourses.some(
          (course) =>
            typeof course === "string" &&
            course.toLowerCase() === studentCourse.trim().toLowerCase()
        );

        reasons.push({
          type: courseMatches ? "match" : "warning",
          text: courseMatches
            ? "Course matches the listed eligible courses."
            : "Course is not in the listed eligible courses.",
        });
      } else {
        reasons.push({
          type: "verify",
          text: "Course eligibility is not listed; verify it on the official portal.",
        });
      }
    } else {
      reasons.push({
        type: "verify",
        text: "Enter your course and verify course eligibility.",
      });
    }

    const incomeStatus = getIncomeStatus(item, studentIncome);

    if (incomeStatus === "match") {
      reasons.push({
        type: "match",
        text: "Entered income meets the listed income thresholds.",
      });
    } else if (incomeStatus === "mismatch") {
      reasons.push({
        type: "warning",
        text: "Entered income does not meet the listed income thresholds.",
      });
    } else {
      reasons.push({
        type: "verify",
        text: "Income eligibility is unknown; check the official scheme rules.",
      });
    }

    reasons.push({
      type: "verify",
      text: "Confirm deadlines, documents and final eligibility on the official portal.",
    });

    return reasons;
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    const profile = {
      ...studentProfile,
      educationLevel: studentLevel,
      education: studentLevel || studentProfile.education || "",
      state: studentState,
      category: studentCategory,
      course: studentCourse.trim(),
      annualIncome: studentIncome,
      familyIncome: studentIncome,
    };

    try {
      localStorage.setItem("tribalStudentProfile", JSON.stringify(profile));
      setStudentProfile(profile);
      setShowMatches(true);
      setShowSavedOnly(false);
      setMessage("Profile saved. Matching scholarships are displayed below.");
    } catch {
      setMessage("Unable to save your profile in this browser.");
    }
  };

  const isSaved = (item) =>
    savedScholarships.some(
      (saved) =>
        Number(saved?.id ?? saved?.scholarshipId ?? saved) ===
        Number(item.id)
    );

  const toggleSaved = (item) => {
    if (isSaved(item)) {
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
      setMessage("Scholarship saved successfully.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLevelFilter("All");
    setPortalFilter("All");
    setShowMatches(false);
    setShowSavedOnly(false);
    setMessage("");
  };

  const filteredScholarships = scholarshipData.filter((item) => {
    const term = search.toLowerCase().trim();

    const matchesSearch =
      (item.name || "").toLowerCase().includes(term) ||
      (item.provider || "").toLowerCase().includes(term) ||
      (item.description || "").toLowerCase().includes(term);

    const matchesLevel =
      levelFilter === "All" ||
      item.level === levelFilter ||
      item.level === "All Levels";

    const matchesPortal =
      portalFilter === "All" || item.portalType === portalFilter;

    const matchesProfile =
      (!studentLevel ||
        item.level === studentLevel ||
        item.level === "All Levels") &&
      (!studentState ||
        item.state === studentState ||
        item.state === "All") &&
      (!studentCategory ||
        item.category === studentCategory ||
        item.category === "All") &&
      getIncomeStatus(item, studentIncome) !== "mismatch";

    const matchesSaved = !showSavedOnly || isSaved(item);
    const matchesStudent = !showMatches || matchesProfile;

    return (
      matchesSearch &&
      matchesLevel &&
      matchesPortal &&
      matchesSaved &&
      matchesStudent
    );
  });

  return (
    <div className="scholarships-page">
      <section className="scholarships-hero">
        <h1>Find Scholarships</h1>
        <p>
          Explore scholarship opportunities that may suit your education
          and profile.
        </p>

        <input
          type="search"
          placeholder="Search scholarships..."
          aria-label="Search scholarships"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      <section className="student-profile-section">
        <h2>Find Scholarships for Me</h2>
        <p>Enter your details to check your profile match.</p>

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
                onChange={(event) => setStudentCategory(event.target.value)}
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
              <label htmlFor="studentIncome">Annual Family Income (₹)</label>
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
            <label htmlFor="levelFilter">Filter by education</label>
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
            <label htmlFor="portalFilter">Filter by portal</label>
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
                  <span className="scholarship-provider">{item.provider}</span>
                  <span className="scholarship-level">{item.level}</span>
                </div>

                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="match-percentage">
                  <div className="match-percentage-heading">
                    <span>Profile Match</span>
                    <strong>
                      {percentage === null
                        ? "Add your profile"
                        : `${percentage}%`}
                    </strong>
                  </div>

                  <div
                    className="match-progress-track"
                    role="progressbar"
                    aria-label="Profile match percentage"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage ?? undefined}
                  >
                    <div
                      className="match-progress-fill"
                      style={{ width: `${percentage ?? 0}%` }}
                    />
                  </div>

                  <small>
                    This percentage reflects only criteria that could be
                    assessed using the available scholarship data. Unknown
                    criteria are excluded, so even a 100% match does not
                    confirm eligibility. Verify all requirements on the
                    official portal.
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
            <p>Try changing your search or filters.</p>
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

            <h2 id="scholarship-modal-title">{selectedScholarship.name}</h2>
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
              {getMatchPercentage(selectedScholarship) === null
                ? "Add your profile"
                : `${getMatchPercentage(selectedScholarship)}%`}
            </p>

            <p>
              This is an estimate based on available data, not an official
              eligibility decision. Verify current eligibility rules,
              deadlines and documents on the official portal.
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
