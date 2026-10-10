
import { useEffect, useState } from "react";
import "./Scholarships.css";
import scholarshipData from "../scholarshipData";
import {
  getScholarships,
  submitApplication,
} from "../services/api";

const emptyProfile = {
  education: "",
  state: "",
  category: "ST",
  course: "",
  familyIncome: "",
};

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function matchesField(itemValue, studentValue) {
  const item = normalize(itemValue);
  const student = normalize(studentValue);

  if (!student || !item) return true;
  if (item === "all" || item === "all levels") return true;

  return item === student;
}

function parseIncome(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const income = Number(String(value).replace(/[₹,\s]/g, ""));
  return Number.isFinite(income) && income >= 0 ? income : null;
}

function normalizeScholarship(item) {
  return {
    ...item,
    id: item.id,
    name: item.name || "Scholarship opportunity",
    provider: item.provider || "Government Scholarship Programme",
    level: item.level || "All Levels",
    portalType: item.portalType || "National",
    state: item.state || "All",
    category: item.category || "All",
    description:
      item.description || "Check the official scheme guidelines.",
    eligibility:
      item.eligibility || "Verify eligibility on the official portal.",
    courseCriteria:
      item.courseCriteria || "Check the official scheme guidelines.",
    eligibleCourses: Array.isArray(item.eligibleCourses)
      ? item.eligibleCourses
      : [],
    deadline: item.deadline || "Check the official portal",
    link: item.link || "",
  };
}

function Scholarships() {
  const [apiScholarships, setApiScholarships] = useState(null);
  const [apiMessage, setApiMessage] = useState("");

  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("tribalStudentProfile");

      return saved
        ? { ...emptyProfile, ...JSON.parse(saved) }
        : { ...emptyProfile };
    } catch {
      return { ...emptyProfile };
    }
  });

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All Levels");
  const [portal, setPortal] = useState("All");
  const [showMatches, setShowMatches] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [savedScholarships, setSavedScholarships] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("savedScholarships")
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [message, setMessage] = useState("");

  // Tracks which scholarship is currently being applied for.
  const [applyingId, setApplyingId] = useState(null);

  const {
    education: studentLevel,
    state: studentState,
    category: studentCategory,
    course: studentCourse,
    familyIncome,
  } = studentProfile;

  // Load scholarships from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadScholarships() {
      try {
        const data = await getScholarships();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected scholarship response");
        }

        if (!cancelled) {
          setApiScholarships(data.map(normalizeScholarship));
          setApiMessage("Connected to the backend successfully.");
        }
      } catch {
        if (!cancelled) {
          setApiScholarships(null);
          setApiMessage(
            "Backend unavailable. Showing local scholarship data."
          );
        }
      }
    }

    loadScholarships();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save the scholarship matching profile locally.
  useEffect(() => {
    localStorage.setItem(
      "tribalStudentProfile",
      JSON.stringify(studentProfile)
    );
  }, [studentProfile]);

  // Save the student's saved scholarship list locally.
  useEffect(() => {
    localStorage.setItem(
      "savedScholarships",
      JSON.stringify(savedScholarships)
    );
  }, [savedScholarships]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setStudentProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit an application to the FastAPI backend.
  const handleApply = async (item) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in before applying for a scholarship.");
      return;
    }

    try {
      setApplyingId(item.id);
      setMessage("");

      const data = await submitApplication(item.id, token);

      setMessage(
        `${data.message}: ${data.scholarship_name}`
      );
    } catch (error) {
      setMessage(
        error.message || "Unable to submit your application."
      );
    } finally {
      setApplyingId(null);
    }
  };

  // Use backend records when available; otherwise use local data.
  const displayScholarships =
    apiScholarships !== null
      ? apiScholarships
      : scholarshipData.map(normalizeScholarship);

  const getMatchPercentage = (item) => {
    const checks = [];
    const income = parseIncome(familyIncome);

    if (studentLevel && studentLevel !== "All Levels") {
      checks.push(matchesField(item.level, studentLevel));
    }

    if (studentState && studentState !== "All") {
      checks.push(matchesField(item.state, studentState));
    }

    if (studentCategory && studentCategory !== "All") {
      checks.push(matchesField(item.category, studentCategory));
    }

    const courses = item.eligibleCourses ?? item.courses ?? [];

    if (studentCourse.trim() && courses.length > 0) {
      checks.push(
        courses.some(
          (course) =>
            normalize(course) === normalize(studentCourse)
        )
      );
    }

    if (income !== null && item.incomeLimit != null) {
      checks.push(income <= Number(item.incomeLimit));
    }

    if (income !== null && item.minimumIncome != null) {
      checks.push(income > Number(item.minimumIncome));
    }

    if (checks.length === 0) return 0;

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  };

  const getMatchReasons = (item) => {
    const reasons = [];
    const income = parseIncome(familyIncome);

    if (studentLevel && studentLevel !== "All Levels") {
      const matched = matchesField(item.level, studentLevel);

      reasons.push({
        type: matched ? "success" : "warning",
        text: matched
          ? `Education level matches this ${item.level} listing.`
          : `This listing is for ${item.level}, not ${studentLevel}.`,
      });
    }

    if (studentState && studentState !== "All") {
      const matched = matchesField(item.state, studentState);

      reasons.push({
        type: matched ? "success" : "warning",
        text: matched
          ? `State matches this ${item.state} listing.`
          : `This listing is associated with ${item.state}.`,
      });
    }

    if (studentCategory && studentCategory !== "All") {
      const matched = matchesField(item.category, studentCategory);

      reasons.push({
        type: matched ? "success" : "warning",
        text: matched
          ? `Category matches this ${item.category} listing.`
          : `The listed category is ${item.category}.`,
      });
    }

    const courses = item.eligibleCourses ?? item.courses ?? [];

    if (studentCourse.trim()) {
      if (courses.length > 0) {
        const matched = courses.some(
          (course) =>
            normalize(course) === normalize(studentCourse)
        );

        reasons.push({
          type: matched ? "success" : "warning",
          text: matched
            ? `${studentCourse} appears in the listed eligible courses.`
            : `${studentCourse} is not in the listed eligible courses.`,
        });
      } else {
        reasons.push({
          type: "info",
          text:
            item.courseCriteria ||
            "Course eligibility needs verification on the official portal.",
        });
      }
    }

    if (income !== null) {
      if (item.incomeLimit != null) {
        const matched = income <= Number(item.incomeLimit);

        reasons.push({
          type: matched ? "success" : "warning",
          text: matched
            ? `Your annual family income is within ₹${Number(
                item.incomeLimit
              ).toLocaleString("en-IN")}.`
            : `Your annual family income exceeds ₹${Number(
                item.incomeLimit
              ).toLocaleString("en-IN")}.`,
        });
      }

      if (item.minimumIncome != null) {
        const matched = income > Number(item.minimumIncome);

        reasons.push({
          type: matched ? "success" : "warning",
          text: matched
            ? `Your annual family income is above ₹${Number(
                item.minimumIncome
              ).toLocaleString("en-IN")}.`
            : `Your annual family income does not exceed ₹${Number(
                item.minimumIncome
              ).toLocaleString("en-IN")}.`,
        });
      }

      if (
        item.incomeLimit == null &&
        item.minimumIncome == null
      ) {
        reasons.push({
          type: "info",
          text:
            "No specific income threshold is provided. Verify the official scheme rules.",
        });
      }
    }

    if (
      normalize(item.name).includes("national scholarship portal")
    ) {
      reasons.push({
        type: "info",
        text:
          "This is a portal listing, not an individual scholarship. Eligibility depends on the specific scheme.",
      });
    }

    return reasons;
  };

  const isSaved = (id) =>
    savedScholarships.some(
      (saved) => (typeof saved === "object" ? saved.id : saved) === id
    );

  const toggleSaved = (item) => {
    if (isSaved(item.id)) {
      setSavedScholarships((previous) =>
        previous.filter(
          (saved) =>
            (typeof saved === "object" ? saved.id : saved) !==
            item.id
        )
      );

      setMessage("Scholarship removed from saved list.");
    } else {
      setSavedScholarships((previous) => [
        ...previous,
        item.id,
      ]);

      setMessage("Scholarship saved successfully.");
    }
  };

  const handleFindMatches = (event) => {
    event.preventDefault();
    setShowMatches(true);
    setShowSavedOnly(false);
    setMessage("Your scholarship matches have been updated.");
  };

  const resetFilters = () => {
    setSearch("");
    setLevel("All Levels");
    setPortal("All");
    setShowMatches(false);
    setShowSavedOnly(false);
    setMessage("");
  };

  const filteredScholarships = displayScholarships.filter((item) => {
    const searchText = normalize(search);

    const matchesSearch =
      !searchText ||
      normalize(item.name).includes(searchText) ||
      normalize(item.provider).includes(searchText) ||
      normalize(item.description).includes(searchText) ||
      normalize(item.eligibility).includes(searchText);

    const matchesLevelFilter =
      level === "All Levels" || matchesField(item.level, level);

    const matchesPortal =
      portal === "All" ||
      normalize(item.portalType) === normalize(portal);

    const matchesProfile =
      !showMatches ||
      ((!studentLevel ||
        studentLevel === "All Levels" ||
        normalize(item.level) === "all levels" ||
        normalize(item.level) === normalize(studentLevel)) &&
        (!studentState ||
          studentState === "All" ||
          normalize(item.state) === "all" ||
          normalize(item.state) === normalize(studentState)) &&
        (!studentCategory ||
          studentCategory === "All" ||
          normalize(item.category) === "all" ||
          normalize(item.category) === normalize(studentCategory)));

    const matchesSaved = !showSavedOnly || isSaved(item.id);

    return (
      matchesSearch &&
      matchesLevelFilter &&
      matchesPortal &&
      matchesProfile &&
      matchesSaved
    );
  });

  return (
    <div className="scholarships-page">
      <section className="scholarships-hero">
        <h1>Find Scholarships for Tribal Students</h1>
        <p>
          Discover scholarship opportunities and explore funding options
          for your education.
        </p>
      </section>

      {apiMessage && <p role="status">{apiMessage}</p>}
      {message && <p role="status">{message}</p>}

      <section className="student-profile-section">
        <h2>Student Profile</h2>
        <p>
          Enter your details to estimate how well scholarship listings
          match your profile.
        </p>

        <form onSubmit={handleFindMatches}>
          <div className="profile-form-grid">
            <div>
              <label htmlFor="education">Education Level</label>
              <select
                id="education"
                name="education"
                value={studentProfile.education}
                onChange={handleProfileChange}
              >
                <option value="">Select Education Level</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={studentProfile.state}
                onChange={handleProfileChange}
              >
                <option value="">Select State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="All">All States</option>
              </select>
            </div>

            <div>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={studentProfile.category}
                onChange={handleProfileChange}
              >
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="All">All Categories</option>
              </select>
            </div>

            <div>
              <label htmlFor="course">Course</label>
              <input
                id="course"
                name="course"
                type="text"
                placeholder="e.g. B.Tech"
                value={studentProfile.course}
                onChange={handleProfileChange}
              />
            </div>

            <div>
              <label htmlFor="familyIncome">
                Annual Family Income (₹)
              </label>
              <input
                id="familyIncome"
                name="familyIncome"
                type="number"
                min="0"
                placeholder="e.g. 250000"
                value={studentProfile.familyIncome}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <button type="submit">Find Matching Scholarships</button>
        </form>
      </section>

      <section className="scholarship-filters">
        <h2>Explore Scholarships</h2>

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search scholarships..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="All Levels">All Education Levels</option>
            <option value="School">School</option>
            <option value="College">College</option>
          </select>

          <select
            value={portal}
            onChange={(event) => setPortal(event.target.value)}
          >
            <option value="All">All Portals</option>
            <option value="National">National</option>
            <option value="State">State</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setShowSavedOnly((previous) => !previous);
              setShowMatches(false);
            }}
          >
            {showSavedOnly
              ? "Show All Scholarships"
              : `Saved Scholarships (${savedScholarships.length})`}
          </button>

          <button type="button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </section>

      {showMatches && (
        <p>
          Showing listings matching your education level, state, and
          category. Verify each scheme's official rules before applying.
        </p>
      )}

      <section className="scholarship-grid">
        {filteredScholarships.map((item) => {
          const percentage = getMatchPercentage(item);
          const reasons = getMatchReasons(item);

          return (
            <article className="scholarship-card" key={item.id}>
              <div className="scholarship-card-header">
                <div>
                  <h3>{item.name}</h3>
                  <p className="scholarship-provider">
                    {item.provider}
                  </p>
                </div>

                <span className="scholarship-level">
                  {item.level}
                </span>
              </div>

              <p>{item.description}</p>

              <div className="match-percentage">
                <p className="match-percentage-heading">
                  Profile Match: {percentage}%
                </p>

                <div
                  className="match-progress-track"
                  role="progressbar"
                  aria-label="Profile match percentage"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="match-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="match-reasons">
                {reasons.length ? (
                  reasons.map((reason, index) => (
                    <p
                      className={`match-reason ${reason.type}`}
                      key={`${item.id}-${index}`}
                    >
                      {reason.text}
                    </p>
                  ))
                ) : (
                  <p className="match-reason info">
                    Enter your profile details to see a match estimate.
                  </p>
                )}
              </div>

              <p>
                <strong>Deadline:</strong>{" "}
                {item.deadline || "Check official portal"}
              </p>

              <div className="scholarship-card-actions">
                <button
                  type="button"
                  onClick={() => setSelectedScholarship(item)}
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => toggleSaved(item)}
                >
                  {isSaved(item.id)
                    ? "Remove Saved"
                    : "Save Scholarship"}
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(item)}
                  disabled={applyingId === item.id}
                >
                  {applyingId === item.id
                    ? "Applying..."
                    : "Apply"}
                </button>

                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official Portal
                  </a>
                ) : (
                  <span>Official link not available</span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {filteredScholarships.length === 0 && (
        <div className="no-scholarships">
          <h3>No scholarships found</h3>
          <p>Try changing your search or filters.</p>

          <button type="button" onClick={resetFilters}>
            Show All Scholarships
          </button>
        </div>
      )}

      {selectedScholarship && (
        <div
          className="scholarship-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedScholarship(null);
            }
          }}
        >
          <div
            className="scholarship-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scholarship-modal-title"
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
              <strong>Provider:</strong>{" "}
              {selectedScholarship.provider || "Not specified"}
            </p>

            <p>
              <strong>Education Level:</strong>{" "}
              {selectedScholarship.level || "Not specified"}
            </p>

            <p>
              <strong>Portal Type:</strong>{" "}
              {selectedScholarship.portalType || "Not specified"}
            </p>

            <p>
              <strong>State:</strong>{" "}
              {selectedScholarship.state || "Not specified"}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {selectedScholarship.category || "Not specified"}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {selectedScholarship.description}
            </p>

            <p>
              <strong>Eligibility:</strong>{" "}
              {selectedScholarship.eligibility ||
                "Check the official scheme guidelines."}
            </p>

            <p>
              <strong>Course Requirements:</strong>{" "}
              {selectedScholarship.courseCriteria ||
                "Check the official scheme guidelines."}
            </p>

            {selectedScholarship.incomeLimit != null && (
              <p>
                <strong>Maximum Annual Income:</strong>{" "}
                ₹
                {Number(
                  selectedScholarship.incomeLimit
                ).toLocaleString("en-IN")}
              </p>
            )}

            {selectedScholarship.minimumIncome != null && (
              <p>
                <strong>Minimum Annual Income:</strong>{" "}
                Above ₹
                {Number(
                  selectedScholarship.minimumIncome
                ).toLocaleString("en-IN")}
              </p>
            )}

            <p>
              <strong>Deadline:</strong>{" "}
              {selectedScholarship.deadline ||
                "Check official portal"}
            </p>

            {selectedScholarship.link ? (
              <a
                href={selectedScholarship.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Official Portal
              </a>
            ) : (
              <p>Official link is not available for this listing.</p>
            )}
          </div>
        </div>
      )}

      <footer>
        <p>
          © 2026 TribalScholar. Supporting educational opportunities for
          tribal students.
        </p>
      </footer>
    </div>
  );
}

export default Scholarships;
