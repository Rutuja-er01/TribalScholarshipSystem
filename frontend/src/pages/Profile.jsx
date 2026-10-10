
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("tribalStudentProfile");

      if (savedProfile) {
        setProfile({
          ...emptyProfile,
          ...JSON.parse(savedProfile),
        });
        setSaved(true);
      }
    } catch {
      setMessage("Could not load the saved profile.");
    }
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

  const handleSave = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(
        "tribalStudentProfile",
        JSON.stringify(profile)
      );

      setMessage("Your profile has been saved successfully!");
      setSaved(true);
    } catch {
      setMessage("Unable to save your profile. Please try again.");
      setSaved(false);
    }
  };

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
              placeholder="Enter your email"
              value={profile.email}
              onChange={handleChange}
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

          <button className="profile-save-button" type="submit">
            {saved ? "Update Profile" : "Save Profile"}
          </button>
        </form>

        <p className="profile-note">
          {saved
            ? "Your profile is saved in this browser."
            : "Save your details to keep your profile updated."}
          {" "}This version is not yet connected to your friend's backend.
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
