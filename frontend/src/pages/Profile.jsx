
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudentProfile, getApiBaseUrl } from "../services/api";
import "./Profile.css";

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

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please log in to view your student profile.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getStudentProfile(token);
        const backendProfile = data.profile || {};

        // Education level is retained locally because the current
        // backend schema does not have a separate education field.
        let localProfile = {};

        try {
          localProfile = JSON.parse(
            localStorage.getItem("tribalStudentProfile") || "{}"
          );
        } catch {
          localProfile = {};
        }

        setProfile({
          ...emptyProfile,
          ...localProfile,
          name: data.name || "",
          email: data.email || "",
          state: backendProfile.state || "",
          category: backendProfile.category || "ST",
          education: localProfile.education || "",
          course: backendProfile.course || "",
          institution: backendProfile.college || "",
          familyIncome:
            backendProfile.family_income != null
              ? String(backendProfile.family_income)
              : "",
        });

        setSaved(true);
        setMessage("");
      } catch (error) {
        setMessage(
          error.message ||
            "Could not load your profile. Please log in again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));

    setMessage("");
    setSaved(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in before saving your profile.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
      const apiRoot = baseUrl.endsWith("/api")
        ? baseUrl
        : `${baseUrl}/api`;

      const response = await fetch(`${apiRoot}/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          state: profile.state,
          category: profile.category,
          course: profile.course,
          college: profile.institution,
          family_income:
            profile.familyIncome === ""
              ? null
              : Number(profile.familyIncome),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save your profile."
        );
      }

      // Keep education level locally until the backend supports it.
      localStorage.setItem(
        "tribalStudentProfile",
        JSON.stringify({
          ...profile,
          name: data.name || profile.name.trim(),
          email: data.email || profile.email,
        })
      );

      setProfile((previousProfile) => ({
        ...previousProfile,
        name: data.name || previousProfile.name.trim(),
        email: data.email || previousProfile.email,
        state: data.profile?.state ?? previousProfile.state,
        category: data.profile?.category ?? previousProfile.category,
        course: data.profile?.course ?? previousProfile.course,
        institution:
          data.profile?.college ?? previousProfile.institution,
        familyIncome:
          data.profile?.family_income != null
            ? String(data.profile.family_income)
            : previousProfile.familyIncome,
      }));

      // Keep the saved student name in sync with the login details.
      const student = JSON.parse(
        localStorage.getItem("student") || "{}"
      );

      localStorage.setItem(
        "student",
        JSON.stringify({
          ...student,
          name: data.name || profile.name.trim(),
          email: data.email || profile.email,
        })
      );

      setMessage("Your profile has been saved successfully!");
      setSaved(true);
    } catch (error) {
      setMessage(
        error.message || "Unable to save your profile. Please try again."
      );
      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <p>Loading your student profile...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-heading">
        <div className="profile-avatar">🎓</div>
        <p className="profile-eyebrow">YOUR STUDENT SPACE</p>
        <h1>Student Profile</h1>
        <p>
          Keep your education details updated to make your scholarship
          journey easier.
        </p>
      </section>

      <section className="profile-card">
        <div className="profile-card-heading">
          <div>
            <h2>Personal and Education Details</h2>
            <p>Fill in your details and save your profile.</p>
          </div>
          <span className="profile-leaf">🌿</span>
        </div>

        {message && (
          <div className="profile-message" role="status">
            {message}
          </div>
        )}

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-field">
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={profile.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={profile.email}
              readOnly
              autoComplete="email"
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-state">State</label>
            <input
              id="profile-state"
              name="state"
              type="text"
              placeholder="Enter your state"
              value={profile.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-category">Student Category</label>
            <select
              id="profile-category"
              name="category"
              value={profile.category}
              onChange={handleChange}
              required
            >
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-education">Education Level</label>
            <select
              id="profile-education"
              name="education"
              value={profile.education}
              onChange={handleChange}
              required
            >
              <option value="">Select education level</option>
              <option value="School">School</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-course">Course or Class</label>
            <input
              id="profile-course"
              name="course"
              type="text"
              placeholder="e.g. B.Tech Computer Engineering"
              value={profile.course}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field profile-field-full">
            <label htmlFor="profile-institution">School or College</label>
            <input
              id="profile-institution"
              name="institution"
              type="text"
              placeholder="Enter your school or college name"
              value={profile.institution}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field profile-field-full">
            <label htmlFor="profile-income">
              Annual Family Income (₹)
            </label>
            <input
              id="profile-income"
              name="familyIncome"
              type="number"
              min="0"
              placeholder="Enter annual family income"
              value={profile.familyIncome}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="profile-save-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving Profile..."
              : saved
                ? "Update Profile"
                : "Save Profile"}
          </button>
        </form>

        <p className="profile-note">
          {saved
            ? "Your supported profile details are saved to your account."
            : "Complete your details and save your profile."}
        </p>
      </section>

      <div className="profile-back-links">
        <Link to="/dashboard">Go to Dashboard →</Link>
        <Link to="/scholarships">Explore Scholarships →</Link>
      </div>
    </main>
  );
}

export default Profile;
