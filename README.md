# Hyper Revise - Task Management API

A Hono-based REST API for task and organization management with MongoDB and Cloudflare Workers support.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: MongoDB
- **Validation**: Zod
- **Deployment**: Cloudflare Workers

## Project Structure

```
src/
├── auth/               # Authentication module
│   ├── auth.crud.ts    # Database operations
│   ├── auth.controllers.ts
│   ├── auth.helpers.ts
│   ├── auth.routes.ts
│   ├── auth.schemas.ts     # MongoDB schema (users collection)
│   ├── auth.serivces.ts
│   └── auth.validators.ts  # Zod validators
├── tasks/              # Tasks module
│   ├── tasks.crud.ts   # Database operations
│   ├── tasks.controllers.ts
│   ├── tasks.helpers.ts
│   ├── tasks.routes.ts
│   ├── tasks.schemas.ts
│   ├── tasks.services.ts
│   └── tasks.validators.ts
├── organizations/      # Organizations module
│   ├── orgs.crud.ts    # Database operations
│   ├── orgs.controllers.ts
│   ├── orgs.helpers.ts
│   ├── orgs.routes.ts
│   ├── orgs.schema.ts  # MongoDB schema
│   ├── orgs.services.ts
│   └── orgs.validators.ts
├── phases/             # Phases module
│   ├── phases.crud.ts  # Database operations
│   ├── phases.controllers.ts
│   ├── phases.helpers.ts
│   ├── phases.routes.ts
│   ├── phases.schema.ts # MongoDB schema
│   ├── phases.services.ts
│   └── phases.validators.ts
├── employees/          # Employees module
│   ├── employees.crud.ts      # Database operations
│   ├── employees.controllers.ts
│   ├── employees.helpers.ts   # JWT & auth helpers
│   ├── employees.routes.ts
│   ├── employees.schema.ts    # MongoDB schema
│   ├── employees.services.ts
│   └── employees.validators.ts # Zod validators
├── core/               # Core utilities
│   ├── db.core.ts      # MongoDB connection
│   └── env.core.ts     # Environment variables
└── index.ts            # App entry point

packages/
└── schemas/            # Shared Zod schemas (used by frontend)
    ├── auth.validators.ts
    ├── tasks.validators.ts
    ├── employees.validators.ts
    ├── organizations.validators.ts
    ├── phases.validators.ts
    └── index.ts
```

## Local Development Setup

### Prerequisites

- Bun installed
- MongoDB instance (local or Atlas)

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create a `.dev.vars` file in the project root:

```bash
MONGO_URI=your_mongodb_connection_string
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
```

Or export them in your terminal:

```bash
export MONGO_URI="mongodb://localhost:27017/hyper_revise"
export DB_NAME="hyper_revise"
export JWT_SECRET="your-super-secret-key"
```

### 3. Run Development Server

```bash
bun run dev
```

The server will start at `http://localhost:3000`

### Live Demo

The API is deployed at: **https://hyper-services.onrender.com**

### 4. Run Production Build (Local)

```bash
bun run start
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |

#### Register
```json
Request:
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dob": "1990-01-01",
  "interests": ["coding", "reading"],
  "address": "123 Main St"
}

Response:
{
  "message": "User registered successfully",
  "userId": "..."
}
```

#### Login (accepts email or username)
```json
Request:
{
  "identifier": "john@example.com",
  "password": "password123"
}

# OR using username:
{
  "identifier": "john",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "accessToken": "..."
}
```
A `refresh_token` cookie is also set (httpOnly, 7 days).

#### Refresh Token
```
POST /api/auth/refresh
```
Reads `refresh_token` from cookie and returns a new access token.

---

### Tasks (`/api/tasks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/create` | Create a new task |
| GET | `/api/tasks/get/all` | Get all tasks |
| GET | `/api/tasks/get/:id` | Get task by ID |
| PATCH | `/api/tasks/edit/:id` | Update task |
| DELETE | `/api/tasks/delete/:id` | Delete task |
| PATCH | `/api/tasks/complete/:id` | Mark task as completed |
| PATCH | `/api/tasks/add-team-members/:id` | Add temp team members |
| PATCH | `/api/tasks/join-team/:id` | Join a team (requires auth) |
| PATCH | `/api/tasks/reject-team/:id` | Reject team invitation (requires auth) |

#### Get All Tasks
```
GET /api/tasks/get/all?page=1&populate=created_by,assigned_to
```

Query Parameters:
- `page` - Page number (default: 1)
- `populate` - Comma-separated fields to populate (`created_by`, `assigned_to`)

The populate query performs a lookup from the employees collection to get user details (firstName, lastName, username).

#### Create Task
```json
Request:
{
  "title": "Task title",
  "description": "Task description",
  "assigned_to": "employee_id (optional)",
  "due_date": "2026-04-20",
  "priority": "High",
  "status": "Due"
}

Response:
{
  "message": "Task created successfully",
  "task": { ... }
}
```

---

### Employees (`/api/employees`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/employees/create` | Create a new employee | Yes |
| GET | `/api/employees/get/all` | Get all employees in org | Yes |
| GET | `/api/employees/get/:id` | Get employee by ID | Yes |
| PATCH | `/api/employees/edit/:id` | Update employee | Yes |
| DELETE | `/api/employees/delete/:id` | Delete employee | Yes |

---

### Organizations (`/api/orgs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orgs/create` | Create a new organization | Yes |
| GET | `/api/orgs/get/all` | Get all organizations | No |
| GET | `/api/orgs/get/:id` | Get organization by ID | No |
| PATCH | `/api/orgs/edit/:id` | Update organization | Yes |
| DELETE | `/api/orgs/delete/:id` | Delete organization | Yes |

---

### Phases (`/api/phases`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/phases/create` | Create a new phase | Yes |
| GET | `/api/phases/get/all` | Get all phases | No |
| GET | `/api/phases/get/:id` | Get phase by ID | No |
| PATCH | `/api/phases/edit/:id` | Update phase | Yes |
| DELETE | `/api/phases/delete/:id` | Delete phase | Yes |

---

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Returns "Hello Hono!" |
| GET | `/health` | Health check endpoint |

---

## Zod Schemas

The backend uses shared Zod schemas located in `packages/schemas/`:

| Schema | Fields |
|--------|--------|
| `registerSchema` | username, email, password, firstName, lastName, phone, dob, interests, address |
| `loginSchema` | identifier (email or username), password |
| `createTaskSchema` | title, created_by, assigned_to, starting_date, due_date, status, team, phase, description, priority |
| `updateTaskSchema` | Optional versions of createTaskSchema fields |
| `createOrgSchema` | name, founder, admin, departments |
| `createEmployeeSchema` | userId, isAdmin, isFounder, department, organization, role, joiningDate |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |

---

## Deploying to Cloudflare Workers

### Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- MongoDB Atlas database (Cloudflare Workers can't connect to local MongoDB)

### 1. Update Environment Variables for Cloudflare

```bash
wrangler secret put MONGO_URI
wrangler secret put DB_NAME
wrangler secret put JWT_SECRET
```

### 2. Build and Deploy

```bash
bun run deploy
```

### 3. Test Your Deployment

```bash
wrangler tail
```

Visit your Workers URL (e.g., `https://your-project.workers.dev/health`)