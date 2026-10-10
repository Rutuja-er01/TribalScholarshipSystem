import { useState } from "react";

function Scholarships() {
const [search, setSearch] = useState("");
const [level, setLevel] = useState("All");
const [selectedScholarship, setSelectedScholarship] = useState(null);

// Sample scholarship data for the project
const scholarships = [
{
id: 1,
name: "Pre-Matric Scholarship",
level: "School",
provider: "Government Scholarship",
description:
"Financial assistance for eligible tribal students studying in school.",
eligibility:
"Eligibility depends on the official scheme rules, class, family income, and other applicable conditions.",
},
{
id: 2,
name: "Post-Matric Scholarship",
level: "College",
provider: "Government Scholarship",
description:
"Financial assistance for eligible tribal students pursuing education after matriculation.",
eligibility:
"Eligibility depends on the official scheme rules, recognized course, family income, and other applicable conditions.",
},
{
id: 3,
name: "Higher Education Scholarship",
level: "College",
provider: "Education Support Scheme",
description:
"Support for eligible students pursuing higher education and professional courses.",
eligibility:
"Students must satisfy the applicable scheme requirements, including academic and income criteria where required.",
},
{
id: 4,
name: "Research Scholarship",
level: "Research",
provider: "Research Support Scheme",
description:
"Potential financial support for eligible students pursuing research or advanced studies.",
eligibility:
"Eligibility depends on the particular research scheme, institution, academic qualifications, and official guidelines.",
},
];

// Search by scholarship name and filter by education level
const filteredScholarships = scholarships.filter((scholarship) => {
const matchesSearch = scholarship.name
.toLowerCase()
.includes(search.toLowerCase());


const matchesLevel =
  level === "All" || scholarship.level === level;

return matchesSearch && matchesLevel;


});

return ( <section className="scholarship-section"> <div className="scholarship-heading"> <span className="eyebrow">OPPORTUNITIES FOR TRIBAL STUDENTS</span> <h1>Explore Scholarships</h1> <p className="section-description">
Discover scholarship opportunities to support your educational
journey. Search by name or filter by education level. </p> </div>


  <div className="filters">
    <input
      type="text"
      placeholder="Search scholarships..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      aria-label="Search scholarships"
    />

    <select
      value={level}
      onChange={(event) => setLevel(event.target.value)}
      aria-label="Filter by education level"
    >
      <option value="All">All Education Levels</option>
      <option value="School">School</option>
      <option value="College">College</option>
      <option value="Research">Research</option>
    </select>
  </div>

  <p className="results-count">
    {filteredScholarships.length} scholarship
    {filteredScholarships.length !== 1 ? "s" : ""} found
  </p>

  <div className="scholarship-grid">
    {filteredScholarships.length > 0 ? (
      filteredScholarships.map((scholarship) => (
        <article className="scholarship-card" key={scholarship.id}>
          <span className="level-tag">{scholarship.level}</span>

          <h2>{scholarship.name}</h2>

          <p className="card-description">
            {scholarship.description}
          </p>

          <p className="provider">
            Provider: {scholarship.provider}
          </p>

          <button
            type="button"
            className="details-button"
            onClick={() => setSelectedScholarship(scholarship)}
          >
            View Details
          </button>
        </article>
      ))
    ) : (
      <div className="no-results">
        <h2>No scholarships found</h2>
        <p>Try a different search term or education level.</p>

        <button
          type="button"
          className="details-button"
          onClick={() => {
            setSearch("");
            setLevel("All");
          }}
        >
          Clear Filters
        </button>
      </div>
    )}
  </div>

  {selectedScholarship && (
    <div
      className="details-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedScholarship(null);
        }
      }}
    >
      <div
        className="details-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scholarship-title"
      >
        <button
          type="button"
          className="close-button"
          onClick={() => setSelectedScholarship(null)}
          aria-label="Close scholarship details"
        >
          ×
        </button>

        <span className="level-tag">
          {selectedScholarship.level}
        </span>

        <h2 id="scholarship-title">
          {selectedScholarship.name}
        </h2>

        <p>{selectedScholarship.description}</p>

        <h3>Eligibility Information</h3>
        <p>{selectedScholarship.eligibility}</p>

        <p>
          <strong>Provider:</strong>{" "}
          {selectedScholarship.provider}
        </p>

        <div className="verification-note">
          <strong>Important:</strong> These entries are sample data
          for demonstration. Confirm actual scheme names, eligibility,
          benefits, deadlines, and application procedures through
          official government sources.
        </div>

        <button
          type="button"
          className="details-button"
          onClick={() => setSelectedScholarship(null)}
        >
          Close Details
        </button>
      </div>
    </div>
  )}
</section>

);
}

export default Scholarships;
