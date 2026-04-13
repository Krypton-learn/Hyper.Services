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

#### Register
```json
Request:
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "userId": "..."
}
```

#### Login
```json
Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "accessToken": "..."
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

#### Create Employee (requires Authorization header)
```
Authorization: Bearer <access_token>

POST /api/employees/create
```

```json
Request:
{
  "username": "john",
  "email": "john@example.com",
  "passwordHash": "hashed_password",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "position": "Developer",
  "department": "Engineering",
  "role": "employee"
}

Response:
{
  "message": "Employee created successfully",
  "employee": { ... }
}
```

Note: Only organization founder or admin can create employees. The organization is automatically assigned from the authenticated user's organization.

#### Get All Employees (requires Authorization header)
```
Authorization: Bearer <access_token>

GET /api/employees/get/all
```

Returns all employees belonging to the authenticated user's organization.

---

### Organizations (`/api/orgs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orgs/create` | Create a new organization | Yes |
| GET | `/api/orgs/get/all` | Get all organizations | No |
| GET | `/api/orgs/get/:id` | Get organization by ID | No |
| PATCH | `/api/orgs/edit/:id` | Update organization | Yes |
| DELETE | `/api/orgs/delete/:id` | Delete organization | Yes |

#### Create Organization (requires Authorization header)
```
Authorization: Bearer <access_token>

POST /api/orgs/create
```

```json
Request:
{
  "name": "Organization name",
  "admin": ["user_id1", "user_id2"],
  "departments": ["Engineering", "Marketing"]
}

Response:
{
  "message": "Organization created successfully",
  "org": { ... }
}
```

Note: 
- The founder is automatically set from the authenticated user's token and added to the admin array.
- When an organization is created, the founder's user profile is updated with the organization ID.
- A corresponding employee record is created for the founder with `role: 'Head'`.

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

## Database Schemas

### Users Schema (auth.schemas.ts)

| Field | Type | Description |
|-------|------|-------------|
| `username` | String | Username (required, unique) |
| `email` | String | Email (required, unique) |
| `passwordHash` | String | Hashed password (required) |
| `organization` | ObjectId | Reference to organization |
| `created_at` | Date | Creation timestamp |
| `updated_at` | Date | Last update timestamp |

### Employees Schema (employees.schema.ts)

| Field | Type | Description |
|-------|------|-------------|
| `username` | String | Username (required, unique) |
| `email` | String | Email (required, unique) |
| `passwordHash` | String | Hashed password (required) |
| `firstName` | String | First name |
| `lastName` | String | Last name |
| `phone` | String | Phone number |
| `position` | String | Job position |
| `department` | String | Department |
| `organization` | ObjectId | Reference to organization |
| `role` | Enum | "employee" or "Head" |
| `profilePicture` | String | Profile image URL |
| `address` | String | Address |
| `joiningDate` | Date | Date of joining |
| `created_at` | Date | Creation timestamp |
| `updated_at` | Date | Last update timestamp |

### Organizations Schema (orgs.schema.ts)

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Organization name (required) |
| `founder` | ObjectId | Reference to employee (required) |
| `admin` | ObjectId[] | Array of admin user IDs |
| `departments` | String[] | List of department names |
| `created_at` | Date | Creation timestamp |
| `updated_at` | Date | Last update timestamp |

### Tasks Schema (tasks.schemas.ts)

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Task title (required) |
| `created_by` | ObjectId | Reference to employee |
| `assigned_to` | ObjectId | Assigned employee |
| `starting_date` | Date | Task start date |
| `due_date` | Date | Task due date |
| `status` | Enum | "Due", "Upcoming", "Completed" |
| `team` | ObjectId[] | Team members |
| `phase` | ObjectId | Reference to phase |
| `tempTeamMembers` | ObjectId[] | Pending team invitations |
| `description` | String | Task description |
| `priority` | Enum | "Low", "Medium", "High", "Urgent" |

### Phases Schema (phases.schema.ts)

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Phase name (required) |
| `description` | String | Phase description |
| `tasks` | ObjectId[] | References to tasks |
| `budget` | Number | Phase budget |
| `starting_date` | Date | Phase start date |
| `ending_date` | Date | Phase end date |
| `sops` | ObjectId[] | References to SOP documents |
| `organization` | ObjectId | Reference to organization (required) |
| `created_at` | Date | Creation timestamp |
| `updated_at` | Date | Last update timestamp |

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

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
