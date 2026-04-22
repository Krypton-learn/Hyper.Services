# Hyper Revise

A Cloudflare Workers API for organization management with milestones and tasks, built with Hono, D1, and JWT authentication.

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
│   ├── jwt.lib.ts        # JWT utilities (sign, verify, generate access/refresh tokens)
│   ├── password.lib.ts  # hashPassword, verifyPassword (SHA-256)
│   └── token.lib.ts     # generateOrgKey() - Random alphanumeric org token
└── modules/
    ├── auth/              # Authentication module (register, login, refresh)
    │   ├── auth.schema.ts     # Zod schemas (registerUserSchema, loginSchema)
    │   ├── auth.crud.ts      # Database operations (createUser, findUserBy*)
    │   ├── auth.services.ts  # Business logic (registerUser, loginUser)
    │   ├── auth.controllers.ts # Request handlers (register, login, refresh)
    │   └── auth.routes.ts    # Route definitions
    ├── orgs/               # Organizations module
    │   ├── orgs.schema.ts     # Zod schemas, TypeScript types
    │   ├── orgs.crud.ts      # Database operations
    │   ├── orgs.services.ts  # Business logic
    │   ├── orgs.controllers.ts # Request handlers
    │   └── orgs.routes.ts    # Route definitions
    ├── milestones/          # Milestones module
    │   ├── milestones.schema.ts # Zod schemas
    │   ├── milestones.crud.ts  # Database operations
    │   ├── milestones.services.ts # Business logic
    │   ├── milestones.controllers.ts # Request handlers
    │   └── milestones.routes.ts # Route definitions
    └── tasks/                # Tasks module
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

### Organization Members Junction Table

```sql
CREATE TABLE organization_members (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  is_founder INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  department TEXT,
  role TEXT DEFAULT 'Member',
  joined_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
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
  token TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  starting_date TEXT,
  ending_date TEXT,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
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
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | None |
| POST | `/auth/login` | Login (returns access token + refresh cookie) | None |
| POST | `/auth/refresh` | Refresh access token using refresh cookie | Cookie |

### Organizations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orgs/create-org` | Create organization | JWT |
| GET | `/orgs/get-orgs/me` | Get user's organizations | JWT |
| GET | `/orgs/get-org/:id` | Get organization with members | JWT |
| POST | `/orgs/join-org` | Join organization by token | JWT |
| PUT | `/orgs/edit-org/:id` | Update organization | JWT (founder/admin) |
| DELETE | `/orgs/remove-org/:id` | Remove organization | JWT (founder) |

### Milestones

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/milestones/create-milestone/:orgId` | Create milestone | JWT (org founder) |
| GET | `/milestones/get-all/:orgId` | Get org's milestones | JWT (member) |
| PUT | `/milestones/edit-milestone/:id` | Update milestone | JWT (creator) |
| DELETE | `/milestones/remove-milestone/:id` | Delete milestone | JWT (creator) |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tasks/create-task/:token` | Create task | JWT (org member) |
| GET | `/tasks/get-all/:token` | Get org's tasks | JWT (member) |
| PUT | `/tasks/update-task/:token/:id` | Update task | JWT (creator) |
| DELETE | `/tasks/remove-task/:token/:id` | Delete task | JWT (creator) |

## Request/Response Examples

### Register

```bash
curl -X POST http://localhost:8787/auth/register \
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
curl -X POST http://localhost:8787/auth/login \
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
curl -X POST http://localhost:8787/auth/refresh \
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
curl -X POST http://localhost:8787/orgs/create-org \
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
curl -X POST http://localhost:8787/orgs/join-org \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "token": "ABC1234"
  }'
```

### Create Milestone

```bash
curl -X POST http://localhost:8787/milestones/create-milestone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Q1 Goals",
    "description": "First quarter objectives",
    "budget": 5000,
    "category": "Planning",
    "token": "ABC1234",
    "startingDate": "2026-01-01T00:00:00Z",
    "endingDate": "2026-03-31T00:00:00Z"
  }'
```

Response:
```json
{
  "milestone": {
    "id": "mile_...",
    "name": "Q1 Goals",
    "description": "First quarter objectives",
    "budget": 5000,
    "category": "Planning",
    "token": "ABC1234",
    "createdBy": "user_...",
    "createdAt": "2026-04-21T...",
    "startingDate": "2026-01-01T00:00:00Z",
    "endingDate": "2026-03-31T00:00:00Z"
  }
}
```

### Create Task

```bash
curl -X POST http://localhost:8787/tasks/create-task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "milestoneId": "mile_...",
    "token": "ABC1234",
    "title": "Implement Login",
    "description": "Add JWT authentication",
    "startingDate": "2026-04-20T00:00:00Z",
    "dueDate": "2026-04-25T00:00:00Z",
    "priority": "High",
    "team": [],
    "tempTeam": []
  }'
```

Response:
```json
{
  "task": {
    "id": "task_...",
    "milestoneId": "mile_...",
    "token": "ABC1234",
    "title": "Implement Login",
    "description": "Add JWT authentication",
    "startingDate": "2026-04-20T00:00:00Z",
    "dueDate": "2026-04-25T00:00:00Z",
    "priority": "High",
    "team": [],
    "tempTeam": [],
    "createdBy": "user_...",
    "createdAt": "2026-04-21T..."
  }
}
```

## Migrations

Run migrations using Cloudflare D1:

```bash
wrangler d1 execute <database_name> --file=migrations/001_initial_schema.sql
wrangler d1 execute <database_name> --file=migrations/002_tasks_schema.sql
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

### Type Generation

```bash
npm run cf-typegen
```

---

## Frontend

React + TypeScript frontend built with Vite 7.3, Tailwind CSS 3, TanStack Router, TanStack Query, and Zustand.

### Tech Stack

- **Build Tool**: Vite 7.3
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 3
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **State Management**: Zustand

### Project Structure

```
frontend/
├── src/
│   ├── main.tsx           # App entry point
│   ├── router.tsx        # TanStack Router configuration
│   ├── index.css         # Tailwind imports
│   ├── store/            # Zustand stores
│   └── App.tsx           # Root component
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
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
| `/dashboard` | Dashboard |

### Adding New Routes

Create routes using TanStack Router's file-based routing or manual route definitions in `router.tsx`.

### State Management (Zustand)

```typescript
import { create } from 'zustand'

interface AppState {
  count: number
  increment: () => void
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

### Data Fetching (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query'

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['myData'],
    queryFn: () => fetch('/api/data').then(res => res.json()),
  })
}
```

## License

MIT