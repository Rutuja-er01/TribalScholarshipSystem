
import { useState } from "react";
import "./ApplicationGuide.css";

const steps = [
  {
    number: 1,
    title: "Find a Suitable Scholarship",
    description:
      "Explore national and state scholarship portals to find schemes relevant to your education level, category and state.",
    tips: [
      "Check the Scholarships page on TribalScholar.",
      "Look for schemes for Scheduled Tribe (ST) students.",
      "Note the application deadline.",
    ],
  },
  {
    number: 2,
    title: "Check Eligibility",
    description:
      "Read the official scheme guidelines carefully before starting your application.",
    tips: [
      "Check education level and course requirements.",
      "Verify category, domicile and family income conditions.",
      "Confirm all conditions on the official scheme portal.",
    ],
  },
  {
    number: 3,
    title: "Prepare Your Documents",
    description:
      "Prepare the documents requested by the particular scholarship scheme.",
    tips: [
      "Use the Document Checklist to track your preparation.",
      "Check that names and details match your records.",
      "Make clear digital copies if uploads are required.",
    ],
  },
  {
    number: 4,
    title: "Register or Log In",
    description:
      "Open the official scholarship portal and follow its registration or login instructions.",
    tips: [
      "Use your own valid contact details.",
      "Keep your registration information safe.",
      "Never share your password or OTP with another person.",
    ],
  },
  {
    number: 5,
    title: "Complete and Submit the Application",
    description:
      "Fill in the application form accurately and upload the documents requested by the scheme.",
    tips: [
      "Double-check your personal and academic details.",
      "Review uploaded documents before submitting.",
      "Save the application number and confirmation.",
    ],
  },
  {
    number: 6,
    title: "Track Your Application",
    description:
      "Check the official portal for application updates, verification requests and results.",
    tips: [
      "Log in to check your application status.",
      "Respond to correction requests before their deadlines.",
      "Keep a copy of submitted details and receipts.",
    ],
  },
];

function ApplicationGuide() {
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem("tribalApplicationGuide");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleStep = (number) => {
    setCompletedSteps((previous) => {
      const updated = previous.includes(number)
        ? previous.filter((step) => step !== number)
        : [...previous, number];

      try {
        localStorage.setItem(
          "tribalApplicationGuide",
          JSON.stringify(updated)
        );
      } catch {
        // The guide remains usable if browser storage is unavailable.
      }

      return updated;
    });
  };

  const progress = Math.round(
    (completedSteps.length / steps.length) * 100
  );

  return (
    <main className="application-guide-page">
      <section className="application-guide-hero">
        <span className="guide-tag">STUDENT RESOURCE</span>

        <h1>Scholarship Application Guide</h1>

        <p>
          Your step-by-step guide to finding scholarships,
          preparing documents and tracking your application.
        </p>

        <a href="#application-steps" className="guide-start-button">
          Explore the Steps ↓
        </a>
      </section>

      <section className="guide-progress">
        <div className="guide-progress-heading">
          <div>
            <h2>Your Application Journey</h2>
            <p>
              {completedSteps.length} of {steps.length} steps completed
            </p>
          </div>

          <strong>{progress}%</strong>
        </div>

        <div
          className="guide-progress-track"
          role="progressbar"
          aria-label="Application guide progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="guide-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section
        className="guide-steps-section"
        id="application-steps"
      >
        <h2>How to Apply for a Scholarship</h2>

        <p className="guide-section-description">
          Follow these steps and mark each one when you have
          completed it.
        </p>

        <div className="guide-steps-list">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number);

            return (
              <article
                key={step.number}
                className={`guide-step-card ${
                  isCompleted ? "guide-step-completed" : ""
                }`}
              >
                <div className="guide-step-number">
                  {isCompleted ? "✓" : step.number}
                </div>

                <div className="guide-step-content">
                  <div className="guide-step-heading">
                    <h3>{step.title}</h3>

                    <span>
                      {isCompleted ? "Completed" : `Step ${step.number}`}
                    </span>
                  </div>

                  <p>{step.description}</p>

                  <ul>
                    {step.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`guide-complete-button ${
                      isCompleted ? "completed-button" : ""
                    }`}
                    onClick={() => toggleStep(step.number)}
                  >
                    {isCompleted
                      ? "Mark as Incomplete"
                      : "Mark as Completed"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="guide-important-note">
        <h2>Important Reminder</h2>

        <p>
          Scholarship rules, required documents, deadlines and
          verification procedures vary by scheme. Always follow the
          latest instructions on the official portal. Completing this
          guide does not mean your scholarship application has been
          submitted.
        </p>
      </section>
    </main>
  );
}

export default ApplicationGuide;
