# Smart Task & Team Management System

A MERN full-stack project with authentication, team projects, task assignment, dashboard analytics, and an admin panel.

## Features

- Register, login, logout, and update profile
- JWT authentication with protected routes
- Role-based authorization for admin screens
- Project CRUD with member invitations
- Task CRUD with status and priority filters
- User dashboard with task totals and progress chart
- Admin dashboard with users, projects, tasks, and completion rate
- Admin user activation/deactivation and deletion
- Admin project listing and deletion

## Tech Stack

- Frontend: React, React Router, Axios, Context API, Tailwind CSS, Recharts, Lucide icons
- Backend: Node.js, Express, JWT, bcryptjs, Mongoose
- Database: MongoDB local or MongoDB Atlas

## Project Structure

```text
client/
  src/
    components/
    context/
    layouts/
    pages/
    routes/
    services/
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js
```

## Getting Started

1. Install dependencies:

```bash
npm run install:all
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Update `server/.env` with your MongoDB connection string and JWT secret.

4. Run the app:

```bash
npm run dev
```

The React app runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Admin Account

The first registered account is automatically created as an admin. Every later registration is a normal user.

## API Summary

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile

GET    /api/users

GET    /api/tasks
GET    /api/tasks/summary
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/members

GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/status
DELETE /api/admin/users/:id
GET    /api/admin/projects
DELETE /api/admin/projects/:id
```
