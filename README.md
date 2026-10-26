# TNP Placement Drive Manager

A web-based placement management system that helps Training and Placement (TNP) departments manage company placement drives and student registrations through a centralized platform.

## Overview

The **TNP Placement Drive Manager** is a full-stack web application developed to simplify the placement registration process. Administrators can create and manage placement drives, while students can view available opportunities and register for suitable drives.

The application stores data in PostgreSQL and uses Prisma ORM to communicate with the database.

## Key Features

### Admin Module
- Secure admin login and session-based authentication.
- Create and publish placement drives.
- Manage placement drive details.
- View student applications.
- Access registered student information through the admin dashboard.

### Student Module
- View available placement drives.
- Check company, role, eligibility, and drive information.
- Register for a placement drive by submitting student details.
- Prevent duplicate registrations for the same drive using the same email address.
- Receive feedback when registration succeeds or fails.

### Database and Security
- PostgreSQL database for persistent storage.
- Prisma ORM for database access and schema management.
- Environment variables for sensitive configuration.
- HTTP-only session cookies for admin authentication.
- Database uniqueness constraint to prevent duplicate student registrations.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web framework |
| React | User interface |
| TypeScript | Type-safe application development |
| Tailwind CSS | Styling and responsive layouts |
| PostgreSQL | Relational database |
| Prisma ORM | Database queries and schema management |
| `jose` | Session token handling |
| Node.js and npm | Runtime and package management |

## Project Structure

```text
placement-drive-manager/
├── app/
│   ├── admin/
│   │   ├── applications/
│   │   ├── login/
│   │   ├── AdminDashboard.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── admin/
│   │   ├── applications/
│   │   └── drives/
│   ├── components/
│   │   └── DriveForm.tsx
│   ├── student/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install or prepare the following:

- Node.js and npm
- PostgreSQL
- Git
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/simxr17kaur-coder/tnp-placement-drive-manager.git
cd tnp-placement-drive-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a local `.env` file in the project root by copying `.env.example`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` locally and replace the placeholders with your own configuration.

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_USERNAME` | Configured admin username |
| `ADMIN_PASSWORD` | Strong admin password |
| `SESSION_SECRET` | Random secret used for session security |

Example format only:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="replace_with_a_strong_password"
SESSION_SECRET="replace_with_a_random_secret_at_least_32_characters_long"
```

**Security:** These are placeholders, not working credentials. Never commit your real `.env` file or share its contents publicly.

### 4. Set Up the Database

Create a PostgreSQL database named `placement_drive_db`, or configure a database name of your choice in `DATABASE_URL`.

Apply the existing Prisma migrations:

```bash
npx prisma migrate deploy
```

If your local setup requires Prisma Client generation, run:

```bash
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open the application at:

http://localhost:3000

Stop the development server using `Ctrl + C`.

## API Documentation

The application provides REST API routes for placement drives, student registrations, admin authentication, and application management.

### Endpoint Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/drives` | Retrieve available placement drives |
| `POST` | `/api/applications` | Submit a student registration |
| `POST` | `/api/admin/login` | Authenticate the administrator |
| `GET` | `/api/admin/drives` | Retrieve drives for admin management |
| `POST` | `/api/admin/drives` | Create a placement drive |
| `GET` | `/api/admin/applications` | Retrieve student applications |
| `GET` | `/api/admin/drives/:id` | Retrieve a specific drive |
| `PUT` | `/api/admin/drives/:id` | Update a placement drive |
| `GET` | `/api/admin/drives/:id/applications` | Retrieve applications for a specific drive |

Admin endpoints require a valid authenticated admin session where enforced by the application.

### Example: Retrieve Placement Drives

**Request**

```http
GET /api/drives
```

**Purpose:** Fetch placement drives available to the student portal.

The response contains the placement drive data returned by the API.

### Example: Register for a Placement Drive

**Request**

```http
POST /api/applications
Content-Type: application/json
```

Example request body (replace the example values with valid fields from the application's registration form):

```json
{
  "driveId": 1,
  "studentName": "Example Student",
  "email": "student@example.com"
}
```

The exact field names and data types must match the application's API implementation.

**Expected behavior:**
- A valid registration is saved to the database.
- A duplicate registration for the same drive and email is rejected.
- Invalid submissions return an error response.

### Example: Admin Login

**Request**

```http
POST /api/admin/login
Content-Type: application/json
```

Use the admin username and password configured in your local environment. Do not include real credentials in public documentation.

On successful authentication, the application establishes an admin session according to its authentication implementation.

### HTTP Status Codes

The precise status code depends on the route implementation and outcome. Common statuses to document and verify include:

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | A resource was created |
| `400 Bad Request` | Invalid request data |
| `401 Unauthorized` | Authentication is required or failed |
| `403 Forbidden` | Access is not permitted |
| `404 Not Found` | Requested resource does not exist |
| `409 Conflict` | Duplicate registration or another conflict, if implemented this way |
| `500 Internal Server Error` | Unexpected server-side error |

Verify actual response codes and JSON structures against the route handlers before treating this table as an exact API contract.

## Testing and Validation

The application has been manually tested for the following workflows:

- Admin login.
- Creating a placement drive.
- Displaying published drives in the student portal.
- Registering a student for a drive.
- Viewing registrations in the admin dashboard.
- Rejecting duplicate registrations for the same drive and email.
- Retaining data after page refresh.
- Retaining data after restarting the development server.

These checks validate the main application workflow in the local development environment.

## Screenshots

Add screenshots of your actual running application to a `screenshots/` folder and link them here.

Suggested screenshots:

1. Student portal showing available placement drives.
2. Admin login page.
3. Admin dashboard showing placement drives.
4. Create placement drive form.
5. Student registration form.
6. Admin view displaying registered students.
7. Duplicate registration error message.

Example Markdown image syntax:

```markdown
![Student Portal](screenshots/student-portal.png)
```

Use actual screenshots and filenames that exist in your repository.

## Future Enhancements

- Student profile management.
- Advanced eligibility filtering.
- Search and filter placement drives.
- Export student applications to CSV or Excel.
- Email notifications for registration and placement updates.
- Role-based access for multiple administrators.
- Deployment to a production hosting platform.

## Learning Outcomes

This project demonstrates practical application of:

- Full-stack web development.
- REST API development.
- Relational database design.
- Database migrations and ORM usage.
- Authentication and session management.
- Form validation and error handling.
- Git and GitHub version control.

## Repository

GitHub: https://github.com/simxr17kaur-coder/tnp-placement-drive-manager

## License

No license has been specified yet. Add a license if you intend to grant others explicit permission to use, modify, or redistribute the project.

## 📸 Project Screenshots

### 1. Home Page
![TNP Placement Drive Manager Home Page](screenshots/home.png)

### 2. Student Portal
![Student Portal](screenshots/student-portal.png)

### 3. Admin Login
![Admin Login](screenshots/admin-login.png)

### 4. Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### 5. Student Registration
![Student Registration Form](screenshots/student-registration.png)