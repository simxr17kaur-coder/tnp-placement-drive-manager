# API Documentation — TNP Placement Drive Manager

## 1. Overview

The TNP Placement Drive Manager provides API endpoints for placement drive management, student registrations, and administrative operations.

**Base URL (local development):**

```text
http://localhost:3000
```

This document describes the student registration endpoint based on the current implementation in `app/api/applications/route.ts`. Other endpoints should be documented after reviewing their route handlers.

---

## 2. Student Registration

### Endpoint Details

| Property | Value |
|---|---|
| Endpoint | `/api/applications` |
| HTTP Method | `POST` |
| Content-Type | `application/json` |
| Authentication | No authentication check is present in this route |
| Purpose | Register a student for a published placement drive |

### Request Body

Send a JSON object containing the following fields.

| Field | Type | Required | Description |
|---|---|---|---|
| `studentName` | String | Yes | Student's name |
| `email` | String | Yes | Student's email address |
| `course` | String | Yes | Student's course |
| `studyYear` | String | Yes | Current year of study |
| `branch` | String | Yes | Student's academic branch |
| `preferredDomain` | String | Yes | Student's preferred domain |
| `placementDriveId` | String | Yes | ID of the placement drive |
| `cgpa` | Number or numeric string | Yes | CGPA between 0 and 10 |

All fields are required. The API trims surrounding whitespace from string fields and converts the email address to lowercase.

### Sample Request

```http
POST /api/applications
Content-Type: application/json
```

```json
{
  "studentName": "Example Student",
  "email": "student@example.com",
  "course": "B.Tech",
  "studyYear": "3rd Year",
  "branch": "Computer Science",
  "preferredDomain": "Software Development",
  "placementDriveId": "REPLACE_WITH_A_REAL_DRIVE_ID",
  "cgpa": 8.5
}
```

**Important:** Replace the example drive ID with the ID of an existing, published placement drive in your database. The example student and email are fictional.

### Example Using PowerShell

```powershell
$body = @{
    studentName = "Example Student"
    email = "student@example.com"
    course = "B.Tech"
    studyYear = "3rd Year"
    branch = "Computer Science"
    preferredDomain = "Software Development"
    placementDriveId = "REPLACE_WITH_A_REAL_DRIVE_ID"
    cgpa = 8.5
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3000/api/applications" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

Replace the drive ID and example data before testing.

---

## 3. Successful Registration

**HTTP Status:** `201 Created`

When validation succeeds and the application is saved, the API returns a success message and selected application details.

### Sample Response

```json
{
  "message": "Registration successful!",
  "application": {
    "id": "EXAMPLE_APPLICATION_ID",
    "studentName": "Example Student",
    "email": "student@example.com",
    "placementDriveId": "EXAMPLE_DRIVE_ID",
    "status": "PENDING",
    "createdAt": "2026-10-26T10:00:00.000Z"
  }
}
```

The IDs, status, and timestamp above are illustrative. The actual values depend on the database and the model defaults.

---

## 4. Validation and Error Responses

### A. Missing Required Fields

**HTTP Status:** `400 Bad Request`

```json
{
  "error": "Please complete all required fields."
}
```

Returned when a required field is missing or empty.

### B. Invalid Email

**HTTP Status:** `400 Bad Request`

```json
{
  "error": "Please enter a valid email address."
}
```

The API performs basic email-format validation.

### C. Invalid CGPA

**HTTP Status:** `400 Bad Request`

```json
{
  "error": "CGPA must be a number between 0 and 10."
}
```

The CGPA must be numeric and within the inclusive range of 0 to 10.

### D. Unavailable Placement Drive

**HTTP Status:** `404 Not Found`

```json
{
  "error": "This placement drive is unavailable for registration."
}
```

Returned when the drive does not exist or its status is not `PUBLISHED`.

### E. Ineligible Branch

**HTTP Status:** `400 Bad Request`

Example:

```json
{
  "error": "Your branch (Civil Engineering) is not eligible for this drive. Eligible branches: Computer Science, Information Technology."
}
```

The API compares the student's branch with the drive's eligible branches, ignoring case and surrounding whitespace. The values `All` and `All Branches` allow all branches.

### F. CGPA Below the Minimum

**HTTP Status:** `400 Bad Request`

Example:

```json
{
  "error": "Your CGPA is below the minimum required CGPA of 7.5."
}
```

This response is returned when a minimum CGPA is configured and the student's CGPA is lower than that requirement.

### G. Duplicate Registration

**HTTP Status:** `409 Conflict`

```json
{
  "error": "You have already registered for this placement drive using this email."
}
```

The API detects Prisma's `P2002` unique-constraint error and returns this response. The database constraint is intended to prevent registering the same email for the same placement drive more than once.

### H. Unexpected Server Error

**HTTP Status:** `500 Internal Server Error`

```json
{
  "error": "Something went wrong while processing your registration."
}
```

Returned for unexpected errors caught by the route handler. Detailed error information is logged on the server rather than returned to the client.

---

## 5. Validation Workflow

The registration endpoint follows this sequence:

1. Read the submitted JSON.
2. Normalize and validate required fields.
3. Validate the email address.
4. Convert and validate the CGPA.
5. Confirm that the placement drive exists and is published.
6. Check branch eligibility.
7. Check the minimum CGPA requirement, if configured.
8. Save the application to PostgreSQL through Prisma.
9. Return `201 Created` with the application details.
10. Return an appropriate error response if a validation or database check fails.

---

## 6. HTTP Status Summary

| Status Code | Meaning in This Endpoint |
|---|---|
| `201` | Registration successful |
| `400` | Required-field, email, CGPA, branch, or minimum-CGPA validation failed |
| `404` | Placement drive unavailable |
| `409` | Unique-constraint conflict, including duplicate registration |
| `500` | Unexpected server-side error |

---

## 7. Testing Checklist

- [ ] Register using valid details and a published drive.
- [ ] Submit a request with missing fields.
- [ ] Submit an invalid email address.
- [ ] Submit a CGPA below 0 or above 10.
- [ ] Submit an ineligible branch.
- [ ] Submit a CGPA below the drive's minimum.
- [ ] Attempt to register for an unpublished or nonexistent drive.
- [ ] Attempt to register twice using the same email and drive.
- [ ] Confirm successful applications appear in the admin dashboard.

## 8. Implementation Reference

**Source file:** `app/api/applications/route.ts`

**Technologies involved:** Next.js Route Handlers, TypeScript, Prisma ORM, and PostgreSQL.
