# Database Validation Checklist

## 1. Student Data
- [ ] Student name must not be empty.
- [ ] Email must have a valid format.
- [ ] Student email addresses must be unique.
- [ ] Family income must be a non-negative number.
- [ ] Required fields must be provided.
- [ ] Passwords must be hashed securely if stored.
- [ ] Only necessary personal information should be collected.

## 2. Scholarship Data
- [ ] Scholarship name must not be empty.
- [ ] Eligibility criteria must be defined.
- [ ] Required documents must be listed.
- [ ] Application deadlines must have valid dates.
- [ ] Unknown deadlines must be stored as `null`.
- [ ] Eligibility and deadline information must be verified using official sources.
- [ ] Inactive scholarships must not accept new applications.

## 3. Application Data
- [ ] Each application must reference an existing student.
- [ ] Each application must reference an existing scholarship.
- [ ] Duplicate applications must be prevented unless explicitly permitted.
- [ ] Submission dates must be valid.
- [ ] Status must be one of `Applied`, `Under Review`, `Approved`, or `Rejected`.
- [ ] New applications should start with the `Applied` status.

## 4. Relationships and Integrity
- [ ] One student can apply for multiple scholarships.
- [ ] One scholarship can receive applications from multiple students.
- [ ] Each application links one student to one scholarship.
- [ ] Invalid student or scholarship references must be rejected.
- [ ] Unique email and application indexes should be configured where appropriate.

## 5. Security
- [ ] Backend input validation must be implemented.
- [ ] Access to personal student information must be restricted.
- [ ] Sample data must not contain real student information.
- [ ] Placeholder IDs must not be inserted as real application references.

## 6. Testing
- [ ] Test valid student registration.
- [ ] Test invalid email and negative income.
- [ ] Test duplicate student emails.
- [ ] Test valid scholarship records.
- [ ] Test invalid application statuses.
- [ ] Test invalid student and scholarship references.
- [ ] Test duplicate applications.
- [ ] Test scholarships with unknown deadlines.
- [ ] Test appropriate error responses.

## 7. Backend Integration
- [ ] Confirm field names and collection names with the backend developer.
- [ ] Confirm the data types used by the backend.
- [ ] Confirm validation rules are implemented.
- [ ] Test database operations using demonstration data.
- [ ] Confirm frontend and backend responses work correctly.

## Note
This checklist describes recommended validation rules. Confirm implementation details with the backend developer before considering each item complete.