
import { useEffect, useState } from "react";
import "./DocumentChecklist.css";

const documents = [
  {
    id: 1,
    name: "Aadhaar Card",
    description: "Identity document, if required by the scheme.",
  },
  {
    id: 2,
    name: "Scheduled Tribe (ST) Certificate",
    description: "Proof of ST category, where applicable.",
  },
  {
    id: 3,
    name: "Income Certificate",
    description: "Family income proof, if required.",
  },
  {
    id: 4,
    name: "Previous Year Marksheet",
    description: "Academic records required by the scheme.",
  },
  {
    id: 5,
    name: "Bonafide Certificate",
    description: "Proof of current enrolment, where required.",
  },
  {
    id: 6,
    name: "Bank Account Details",
    description: "Account details meeting the scheme's requirements.",
  },
  {
    id: 7,
    name: "Domicile Certificate",
    description: "State residence proof, if applicable.",
  },
  {
    id: 8,
    name: "Passport-size Photograph",
    description: "A recent photograph, if requested.",
  },
];

function readChecklist() {
  try {
    const saved = localStorage.getItem("tribalDocumentChecklist");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function DocumentChecklist() {
  const [checkedDocuments, setCheckedDocuments] = useState(readChecklist);

  useEffect(() => {
    try {
      localStorage.setItem(
        "tribalDocumentChecklist",
        JSON.stringify(checkedDocuments)
      );
    } catch {
      // Keep the checklist usable if browser storage is unavailable.
    }
  }, [checkedDocuments]);

  const toggleDocument = (id) => {
    setCheckedDocuments((previous) =>
      previous.includes(id)
        ? previous.filter((documentId) => documentId !== id)
        : [...previous, id]
    );
  };

  const completed = documents.filter((document) =>
    checkedDocuments.includes(document.id)
  ).length;

  const progress = Math.round(
    (completed / documents.length) * 100
  );

  const resetChecklist = () => {
    setCheckedDocuments([]);
  };

  return (
    <main className="document-checklist-page">
      <section className="document-checklist-hero">
        <span className="document-checklist-tag">
          STUDENT TOOLKIT
        </span>

        <h1>Scholarship Document Checklist</h1>

        <p>
          Keep track of the documents you have prepared for your
          scholarship applications.
        </p>
      </section>

      <section className="document-checklist-content">
        <div className="document-progress-card">
          <div className="document-progress-heading">
            <div>
              <h2>Your Progress</h2>
              <p>
                {completed} of {documents.length} documents checked
              </p>
            </div>

            <strong>{progress}%</strong>
          </div>

          <div
            className="document-progress-track"
            role="progressbar"
            aria-label="Document preparation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="document-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="document-checklist-list">
          <h2>Documents to Prepare</h2>

          <p className="document-checklist-note">
            These are common examples, not a mandatory list for every
            scholarship. Check the official scheme guidelines before
            submitting your application.
          </p>

          {documents.map((document) => {
            const isChecked = checkedDocuments.includes(document.id);

            return (
              <label
                key={document.id}
                className={`document-checklist-item ${
                  isChecked ? "document-completed" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDocument(document.id)}
                />

                <span className="document-checklist-text">
                  <strong>{document.name}</strong>
                  <small>{document.description}</small>
                </span>

                <span className="document-check-status">
                  {isChecked ? "Prepared" : "Pending"}
                </span>
              </label>
            );
          })}

          <button
            type="button"
            className="document-reset-button"
            onClick={resetChecklist}
            disabled={completed === 0}
          >
            Reset Checklist
          </button>
        </div>
      </section>
    </main>
  );
}

export default DocumentChecklist;
