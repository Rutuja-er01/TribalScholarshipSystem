# Tribal Scholarship System — Database Schema

## 1. Overview

This database is designed to manage student profiles, scholarship information, and scholarship applications for tribal students.

The proposed database contains three collections:
- Students
- Scholarships
- Applications

Note: Confirm the schema with the backend developer before integration.

## 2. Students Collection

**Purpose:** Stores registered student profile and education details.

| Field | Suggested Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique student ID |
| `name` | String | Student's full name |
| `email` | String | Student's email; should be unique |
| `state` | String | State of residence |
| `category` | String | Student category, such as ST |
| `education` | String | Current education level |
| `course` | String | Course or programme |
| `institution` | String | School or college |
| `familyIncome` | Number | Annual family income |
| `createdAt` | Date | Account creation date |

**Validation and security**
- Validate email addresses and prevent duplicate accounts.
- Ensure family income is a non-negative number.
- Store passwords only as secure hashes if passwords are managed in this collection.
- Collect only the personal information required by the application.

## 3. Scholarships Collection

**Purpose:** Stores scholarship details shown to students.

| Field | Suggested Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique scholarship ID |
| `name` | String | Scholarship name |
| `category` | String | Scholarship category |
| `description` | String | Scholarship description |
| `eligibilityCriteria` | Array or Object | Eligibility requirements |
| `requiredDocuments` | Array of Strings | Required documents |
| `applicationDeadline` | Date or Null | Verified deadline, if available |
| `isActive` | Boolean | Whether the scholarship is available |
| `createdAt` | Date | Record creation date |

**Validation**
- Verify scholarship details using official sources.
- Do not invent eligibility criteria or deadlines.
- Use `null` when the deadline is unknown or unverified.
- Do not display expired scholarships as open.

## 4. Applications Collection

**Purpose:** Stores applications submitted by students.

| Field | Suggested Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique application ID |
| `studentId` | ObjectId | Reference to a student |
| `scholarshipId` | ObjectId | Reference to a scholarship |
| `submissionDate` | Date | Application submission date |
| `status` | String | Current application status |

Suggested status values:
- `Applied`
- `Under Review`
- `Approved`
- `Rejected`

**Validation**
- Verify that the student and scholarship exist.
- Prevent duplicate applications for the same student and scholarship.
- Allow only valid application statuses.
- Save the submission date when the application is successfully recorded.

## 5. Relationships

- One student can submit multiple applications.
- One scholarship can receive applications from multiple students.
- Each application refers to one student and one scholarship.

```text
Students  ──< Applications >──  Scholarships
```

Applications connects students with the scholarships they apply for.

## 6. Data Integrity and Security

- Use a unique index for student email where appropriate.
- Consider a compound unique index on `studentId` and `scholarshipId` to prevent duplicate applications.
- Validate data on the backend before saving it.
- Ensure students can access only their own protected information.
- Never store passwords in plain text.
- Do not use real student personal information in sample datasets.

## 7. Sample Data and Integration

- Sample JSON files are for testing and demonstration only.
- Replace placeholder IDs with valid database IDs before creating application records.
- Confirm collection names, field names, and data types with the backend developer.
- Verify scholarship information before showing it to students.

## 8. Future Improvements

Possible future additions include:
- Scholarship amount and funding source.
- Application opening date and academic year.
- Application status history.
- Document submission metadata.
- Deadline and status notifications.

Add these only when the project requirements and backend support them.