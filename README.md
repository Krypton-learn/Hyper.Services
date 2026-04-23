# Hyper Revise

A Cloudflare Workers API for organization management with milestones, tasks, and employees, built with Hono, D1, and JWT authentication.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: D1 (Cloudflare SQL)
- **Validation**: Zod
- **Authentication**: JWT with access/refresh tokens

## Project Structure

```
src/
├── index.ts                 # Main app entry - routes registration
├── lib/                    # Utility functions
│   ├── id.lib.ts          # generateId() - UUID v4 generator
│   ├── jwt.lib.ts         # JWT utilities (sign, verify, generate access/refresh tokens)
│   ├── password.lib.ts   # hashPassword, verifyPassword (SHA-256)
│   └── token.lib.ts      # generateOrgKey() - Random alphanumeric org token
└── modules/
    ├── auth/              # Authentication module (register, login, refresh)
    │   ├── auth.schema.ts     # Zod schemas (registerUserSchema, loginSchema)
    │   ├── auth.crud.ts       # Database operations (createUser, findUserBy*)
    │   ├── auth.services.ts  # Business logic (registerUser, loginUser)
    │   ├── auth.controllers.ts # Request handlers (register, login, refresh)
    │   └── auth.routes.ts    # Route definitions
    ├── orgs/               # Organizations module
    │   ├── orgs.schema.ts     # Zod schemas, TypeScript types
    │   ├── orgs.crud.ts       # Database operations
    │   ├── orgs.services.ts  # Business logic
    │   ├── orgs.controllers.ts # Request handlers
    │   └── orgs.routes.ts    # Route definitions
    ├── employees/          # Employees module (renamed from organization_members)
    │   ├── employees.schema.ts # Zod schemas
    │   ├── employees.crud.ts  # Database operations
    │   ├── employees.services.ts # Business logic
    │   ├── employees.controllers.ts # Request handlers
    │   └── employees.routes.ts # Route definitions
    ├── milestones/        # Milestones module
    │   ├── milestones.schema.ts # Zod schemas
    │   ├── milestones.crud.ts  # Database operations
    │   ├── milestones.services.ts # Business logic
    │   ├── milestones.controllers.ts # Request handlers
    │   └── milestones.routes.ts # Route definitions
    └── tasks/              # Tasks module
        ├── tasks.schema.ts     # Zod schemas
        ├── tasks.crud.ts      # Database operations
        ├── tasks.services.ts  # Business logic
        ├── tasks.controllers.ts # Request handlers
        └── tasks.routes.ts    # Route definitions
```

## Architecture

This API follows a layered architecture pattern with clear separation of concerns:

### Layer Flow

```
Request → Controller → Service → CRUD → Database
              ↓
          Validation (Zod Schemas)
```

### Layers

1. **Controllers** (`*.controllers.ts`)
   - Handle HTTP requests/responses
   - Parse and validate request body with Zod
   - Extract and verify JWT
   - Call service layer
   - Return JSON responses

2. **Services** (`*.services.ts`)
   - Business logic
   - Input validation
   - Orchestrate CRUD operations
   - Throw errors with descriptive messages

3. **CRUD** (`*.crud.ts`)
   - Database operations
   - Raw SQL queries via D1
   - Type-safe inputs/outputs

4. **Schemas** (`*.schema.ts`)
   - Zod validation schemas
   - TypeScript type definitions

## Authentication

### Token System

| Token Type | Expiry | Storage | Usage |
|-----------|-------|--------|-------|
| Access Token | 50 minutes | Request header | Authorize API requests |
| Refresh Token | 7 days | HttpOnly cookie | Obtain new access tokens |

### Auth Flow

1. **Register**: Create account with email, name, phone, password
2. **Login**: Validate credentials, receive access token + refresh cookie
3. **Refresh**: Use refresh cookie to get new access token

## Database Schema

The database uses Cloudflare D1 with the following tables:

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  organizations TEXT DEFAULT '[]',
  profile TEXT,
  createdAt TEXT NOT NULL
);
```

### Organizations Table

```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  createdAt TEXT NOT NULL
);
```

### Employees Table (formerly organization_members)

```sql
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  is_founder INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  department TEXT,
  role TEXT DEFAULT 'Member',
  joined_at TEXT NOT NULL
);
```

### Milestones Table

```sql
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  budget REAL,
  category TEXT,
  org_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  starting_date TEXT,
  ending_date TEXT
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL,
  token TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starting_date TEXT,
  due_date TEXT,
  priority TEXT,
  team TEXT DEFAULT '[]',
  temp_team TEXT DEFAULT '[]',
  assigned_to TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

## API Endpoints

All endpoints are prefixed with `/api/`

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | None |
| POST | `/api/auth/login` | Login (returns access token + refresh cookie) | None |
| POST | `/api/auth/refresh` | Refresh access token using refresh cookie | Cookie |

### Organizations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orgs/create-org` | Create organization | JWT |
| GET | `/api/orgs/get-orgs/me` | Get user's organizations | JWT |
| GET | `/api/orgs/get-org/:id` | Get organization with members | JWT |
| POST | `/api/orgs/join-org` | Join organization by token | JWT |
| PUT | `/api/orgs/edit-org/:id` | Update organization | JWT (founder/admin) |
| DELETE | `/api/orgs/remove-org/:id` | Delete organization | JWT (founder) |

### Employees

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/employees/get-all/:orgId` | Get organization's employees | JWT (member) |
| PUT | `/api/employees/update-member/:orgId/:userId` | Update employee details | JWT (admin) |
| DELETE | `/api/employees/remove-member/:orgId/:userId` | Remove employee from org | JWT (founder) |

### Milestones

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/milestones/create-milestone/:orgId` | Create milestone | JWT (org founder) |
| GET | `/api/milestones/get-all/:orgId` | Get org's milestones | JWT (member) |
| PUT | `/api/milestones/edit-milestone/:id` | Update milestone | JWT (creator) |
| DELETE | `/api/milestones/remove-milestone/:id` | Delete milestone | JWT (creator) |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/tasks/create-task/:token` | Create task | JWT (org member) |
| GET | `/api/tasks/get-all/:token` | Get org's tasks | JWT (org member) |
| PUT | `/api/tasks/update-task/:token/:id` | Update task | JWT (creator) |
| DELETE | `/api/tasks/remove-task/:token/:id` | Delete task | JWT (creator) |

## Request/Response Examples

### Register

```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "password": "password123"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid...",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "organizations": [],
    "profile": {},
    "createdAt": "2026-04-21T..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "user": { ... },
  "accessToken": "eyJ..."
}
```

Set-Cookie header includes refresh_token (HttpOnly, 7 days).

### Refresh Token

```bash
curl -X POST http://localhost:8787/api/auth/refresh \
  -H "Cookie: refresh_token=eyJ..."
```

Response:
```json
{
  "accessToken": "eyJ..."
}
```

### Create Organization

```bash
curl -X POST http://localhost:8787/api/orgs/create-org \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "My Organization",
    "description": "A sample organization"
  }'
```

Response:
```json
{
  "org": {
    "id": "org_...",
    "token": "ABC1234",
    "name": "My Organization",
    "description": "A sample organization",
    "createdAt": "2026-04-21T..."
  }
}
```

### Join Organization

```bash
curl -X POST http://localhost:8787/api/orgs/join-org \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "token": "ABC1234"
  }'
```

### Create Milestone

```bash
curl -X POST http://localhost:8787/api/milestones/create-milestone/ABC1234 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Q1 Goals",
    "description": "First quarter objectives",
    "budget": 5000,
    "category": "Planning",
    "startingDate": "2026-01-01T00:00:00Z",
    "endingDate": "2026-03-31T00:00:00Z"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:8787/api/tasks/create-task/ABC1234 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "milestoneId": "mile_...",
    "title": "Implement Login",
    "description": "Add JWT authentication",
    "startingDate": "2026-04-20T00:00:00Z",
    "dueDate": "2026-04-25T00:00:00Z",
    "priority": "High",
    "assignedTo": "user_...",
    "team": [],
    "tempTeam": []
  }'
```

## Migrations

Run migrations using Cloudflare D1:

```bash
wrangler d1 execute hyper-revise-db --file=migrations/001_initial_schema.sql
wrangler d1 execute hyper-revise-db --file=migrations/002_tasks_schema.sql
wrangler d1 execute hyper-revise-db --file=migrations/003_rename_org_members_to_employees.sql
wrangler d1 execute hyper-revise-db --file=migrations/004_add_tasks_completion.sql
wrangler d1 execute hyper-revise-db --file=migrations/005_make_assigned_to_required.sql
```

## Environment Variables

Add to `wrangler.toml`:

```toml
[vars]
JWT_SECRET = "your-secret-key"
```

## Usage

### Setup

```bash
npm install
```

### Development

```bash
npm run dev
```

### Deployment

```bash
npm run deploy
```

---

## Frontend

React + TypeScript frontend built with Vite, Tailwind CSS, TanStack Router, TanStack Query, and Zustand.

### Tech Stack

- **Build Tool**: Vite
- **UI Framework**: React
- **Styling**: Tailwind CSS
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **State Management**: Zustand

### Project Structure

```
frontend/
├── src/
│   ├── main.tsx           # App entry point
│   ├── router.tsx       # TanStack Router configuration
│   ├── index.css        # Tailwind imports
│   ├── api/             # API client and endpoints
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── orgs.api.ts
│   │   ├── employees.api.ts
│   │   ├── milestones.api.ts
│   │   └── tasks.api.ts
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useOrgs.ts
│   │   ├── useEmployees.ts
│   │   ├── useMilestones.ts
│   │   └── useTasks.ts
│   ├── stores/          # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── orgs.store.ts
│   │   ├── employees.store.ts
│   │   ├── milestones.store.ts
│   │   ├── tasks.store.ts
│   │   └── detail.store.ts
│   ├── pages/          # Page components
│   │   ├── auth/
│   │   │   ├── login.pages.tsx
│   │   │   └── register.pages.tsx
│   │   ├── orgs/
│   │   │   ├── OrgsPage.tsx
│   │   │   ├── OrgDashboardPage.tsx
│   │   │   ├── EmployeesPage.tsx
│   │   │   ├── MilestonesPage.tsx
│   │   │   └── tasks/
│   │   │       ├── index.tsx
│   │   │       ├── table.pages.tsx
│   │   │       └── kanban.pages.tsx
│   │   └── profile.tsx
│   ├── layout.tsx       # App layout component
│   └── App.tsx          # Root component
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── package.json
```

### Setup

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

### Routes

| Path | Component |
|------|-----------|
| `/` | Home |
| `/login` | Login |
| `/register` | Register |
| `/orgs` | Organizations List |
| `/orgs/:token` | Organization Dashboard |
| `/orgs/:token/employees` | Employees |
| `/orgs/:token/milestones` | Milestones |
| `/orgs/:token/tasks` | Tasks Board |

## License

MIT