import { Link, useParams } from "react-router-dom";
import "./ScholarshipDetails.css";

const scholarshipDetailsData = {
  "post-matric-st": {
    title: "Post-Matric Scholarship for ST Students",
    level: "College Students",
    description:
      "This scholarship is intended to support eligible Scheduled Tribe students pursuing education after matriculation.",
    eligibility: [
      "The student belongs to the Scheduled Tribe (ST) category.",
      "The student is studying in an eligible post-matric course.",
      "Family income and other conditions must meet the applicable scheme rules.",
    ],
    benefits: [
      "Eligible educational fee support",
      "Possible maintenance allowance, subject to scheme rules",
      "Support for continuing higher education",
    ],
    documents: [
      "ST caste certificate",
      "Income certificate, if required",
      "Previous examination marksheet",
      "Aadhaar card, where required",
      "Bank account details",
      "Current admission or bonafide certificate",
    ],
    link: "https://scholarships.gov.in/",
  },

  "pre-matric-st": {
    title: "Pre-Matric Scholarship for ST Students",
    level: "School Students",
    description:
      "This scholarship category supports eligible Scheduled Tribe students studying at school level.",
    eligibility: [
      "The student belongs to the Scheduled Tribe (ST) category.",
      "The student is enrolled in an eligible school and class.",
      "The student meets the applicable income and scheme conditions.",
    ],
    benefits: [
      "Financial assistance according to the scheme",
      "Support for school education expenses",
      "Encouragement to continue schooling",
    ],
    documents: [
      "ST caste certificate",
      "Income certificate, if required",
      "School identity or bonafide certificate",
      "Previous marksheet, if required",
      "Bank account details, if required",
    ],
    link: "https://scholarships.gov.in/",
  },

  "national-portal": {
    title: "National Scholarship Portal Opportunities",
    level: "Multiple Education Levels",
    description:
      "The National Scholarship Portal provides information and application access for various government scholarship schemes.",
    eligibility: [
      "Eligibility depends on the individual scholarship scheme.",
      "Category, education level, income, and academic conditions may apply.",
      "Check the current official notification before applying.",
    ],
    benefits: [
      "Access to multiple scholarship schemes",
      "Online application facilities for available schemes",
      "Official scheme guidelines and updates",
    ],
    documents: [
      "Identity documents, as specified by the scheme",
      "Academic marksheets",
      "Income and category certificates, where required",
      "Bank details, where required",
    ],
    link: "https://scholarships.gov.in/",
  },

  mahadbt: {
    title: "MahaDBT Scholarship Opportunities",
    level: "Maharashtra Students",
    description:
      "MahaDBT is Maharashtra's official portal for various government benefit schemes, including eligible education-related schemes.",
    eligibility: [
      "The student meets the relevant scheme's category requirements.",
      "The student satisfies Maharashtra domicile and other conditions where applicable.",
      "Income, course, and institution requirements depend on the scheme.",
    ],
    benefits: [
      "Access to eligible state scholarship schemes",
      "Online application and tracking facilities",
      "Scheme-specific educational financial assistance",
    ],
    documents: [
      "Domicile certificate, where required",
      "Caste certificate, where required",
      "Income certificate, where required",
      "Academic marksheets",
      "Admission and fee details",
      "Bank account details",
    ],
    link: "https://mahadbt.maharashtra.gov.in/",
  },
};

function ScholarshipDetails() {
  const { id } = useParams();

  const scholarship = scholarshipDetailsData[id];

  if (!scholarship) {
    return (
      <main className="details-page">
        <div className="details-card not-found">
          <h1>Scholarship Not Found</h1>
          <p>We couldn't find the scholarship you're looking for.</p>

          <Link to="/scholarships" className="back-button">
            Back to Scholarships
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="details-page">
      <Link to="/scholarships" className="back-link">
        ← Back to Scholarships
      </Link>

      <section className="details-hero">
        <span className="details-icon">🎓</span>
        <span className="details-label">{scholarship.level}</span>

        <h1>{scholarship.title}</h1>
        <p>{scholarship.description}</p>
      </section>

      <div className="details-grid">
        <section className="details-card">
          <h2>✅ Eligibility Criteria</h2>
          <ul>
            {scholarship.eligibility.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="details-card">
          <h2>🌱 Benefits</h2>
          <ul>
            {scholarship.benefits.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="details-card documents-card">
          <h2>📄 Required Documents</h2>

          <p>
            These are common examples. The official scheme may require
            different or additional documents.
          </p>

          <ul>
            {scholarship.documents.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="apply-section">
        <h2>Ready to Explore This Scholarship?</h2>

        <p>
          Check the official portal for current eligibility rules,
          deadlines, required documents, and application availability.
        </p>

        <a
          href={scholarship.link}
          target="_blank"
          rel="noopener noreferrer"
          className="apply-button"
        >
          Visit Official Portal ↗
        </a>
      </section>

      <p className="details-disclaimer">
        Note: Scholarship information is for guidance. Eligibility, benefits,
        and required documents must be verified on the official portal.
      </p>
    </main>
  );
}

export default ScholarshipDetails;
