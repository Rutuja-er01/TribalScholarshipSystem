# Tribal Scholarship System — Database Schema

## 1. Students Collection
Stores registered student information.

- name
- email
- state
- category
- education
- course
- institution
- familyIncome

## 2. Scholarships Collection
Stores scholarship information.

- name
- category
- description
- eligibilityCriteria
- requiredDocuments
- applicationDeadline
- isActive

## 3. Applications Collection
Stores student applications.

- studentId
- scholarshipId
- submissionDate
- status

## Notes
- This is a proposed schema; confirm the fields with the existing backend.
- Never store passwords in plain text.
- Verify official eligibility criteria and deadlines before adding real scholarship information.
- Prevent duplicate applications from the same student for the same scholarship.
