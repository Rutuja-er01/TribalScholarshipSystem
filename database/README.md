# Tribal Scholarship System — Database Documentation

## 1. Overview

The database documentation for the Tribal Scholarship System describes how student profiles, scholarship information, and scholarship applications can be organized and managed.

The system aims to help tribal students understand available scholarship opportunities and manage their application information.

This folder contains the proposed database schema, sample JSON records, and data validation guidelines.

## 2. Database Technology

**Proposed database:** MongoDB

MongoDB is a NoSQL database that stores information in flexible, JSON-like documents.

The backend developer should confirm the final database configuration and collection names during integration.

## 3. Proposed Collections

### 3.1 Students

Stores student profile information.

| Field | Suggested Type | Purpose |
|---|---|---|
| `_id` | ObjectId | Unique student identifier |
| `name` | String | Student name |
| `email` | String | Student email address |
| `state` | String | State of residence |
| `category` | String | Student category |
| `education` | String | Current education level |
| `course` | String | Course of study |
| `institution` | String | Educational institution |
| `familyIncome` | Number | Family income |
| `createdAt` | Date | Profile creation date |

### 3.2 Scholarships

Stores scholarship information.

| Field | Suggested Type | Purpose |
|---|---|---|
| `_id` | ObjectId | Unique scholarship identifier |
| `name` | String | Scholarship name |
| `category` | String | Scholarship category |
| `description` | String | Scholarship description |
| `eligibilityCriteria` | Array or Object | Eligibility requirements |
| `requiredDocuments` | Array | Documents required |
| `applicationDeadline` | Date or Null | Application deadline |
| `isActive` | Boolean | Whether the scholarship is active |
| `createdAt` | Date | Record creation date |

### 3.3 Applications

Stores scholarship applications submitted by students.

| Field | Suggested Type | Purpose |
|---|---|---|
| `_id` | ObjectId | Unique application identifier |
| `studentId` | ObjectId | Reference to a student |
| `scholarshipId` | ObjectId | Reference to a scholarship |
| `submissionDate` | Date | Date of submission |
| `status` | String | Current application status |

Suggested application statuses:

- `Applied`
- `Under Review`
- `Approved`
- `Rejected`

The final fields and status values must be confirmed with the backend developer.

## 4. Relationships

The proposed database relationships are:

- One student can apply for multiple scholarships.
- One scholarship can receive applications from multiple students.
- Each application connects one student with one scholarship.

Relationship diagram:

```text
Students ─────< Applications >───── Scholarships
```

## 5. Folder Structure

```text
database/
├── README.md
├── schema.md
├── sample_scholarships.json
├── sample_applications.json
└── validation_checklist.md
```

### File descriptions

- `README.md` — Overview of the database documentation.
- `schema.md` — Detailed field definitions, relationships, and integrity recommendations.
- `sample_scholarships.json` — Demonstration scholarship records.
- `sample_applications.json` — Demonstration application record.
- `validation_checklist.md` — Recommended validation and testing rules.

## 6. Data Validation and Security

The database and backend should enforce appropriate validation rules.

Recommended practices include:

- Validate required fields and data types.
- Enforce unique student email addresses.
- Prevent duplicate applications where applicable.
- Verify that referenced students and scholarships exist.
- Restrict application statuses to agreed values.
- Protect personal student information.
- Hash passwords securely if passwords are stored.
- Use demonstration data for testing instead of real student records.

See `validation_checklist.md` for the detailed checklist.

## 7. Sample Data

The sample JSON files demonstrate the proposed document structure.

They are for development and testing purposes only. They are not verified records of actual government scholarship schemes.

Placeholder identifiers in the sample application file must be replaced with valid references before testing database relationships.

The JSON files do not automatically create database collections or insert records into MongoDB.

## 8. Backend Integration

Before connecting the database documentation to the backend, the team should confirm:

1. Final collection names.
2. Actual field names and data types.
3. Student and scholarship identifier formats.
4. Application status values.
5. Validation rules and duplicate application policy.
6. MongoDB connection and access configuration.

The backend developer is responsible for implementing and testing the actual database operations.

## 9. Future Improvements

Possible improvements include:

- Scholarship opening dates and academic years.
- Scholarship amounts and funding sources.
- Application status history.
- Document upload metadata.
- Application notifications.
- Verified scholarship eligibility and deadlines from official sources.

## 10. Project Status

The database schema documentation, sample JSON files, and validation checklist have been prepared.

Final compatibility with the backend will be checked after the backend models and database operations are available.
