# Hyper Revise API

Cloudflare Workers API with D1 database, JWT authentication, task management, file storage, and AI assistant.

## Architecture

### Project Overview

**Type:** Cloudflare Workers REST API (Serverless Backend)  
**Pattern:** Modular MVC (Routes → Controllers → Services → CRUD → Database)

### Technology Stack

| Category | Technology |
|----------|-------------|
| Runtime/Platform | Cloudflare Workers (Edge computing) |
| Web Framework | Hono v4.12.15 |
| Language | TypeScript |
| Database | Cloudflare D1 (SQLite on edge) |
| Validation | Zod v4.4.1 |
| Authentication | JWT (hono/jwt) with Bearer tokens + refresh |
| File Storage | Backblaze B2 S3-compatible storage |
| AI | Groq (llama-3.3-70b-versatile) |
| Push Notifications | Web Push API (VAPID) |
| Build Tool | Wrangler v4.4.0 |
| Package Manager | Bun |

### Directory Structure

```
hyper_revise/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── lib/                    # Shared utilities
│   │   ├── auth.ts             # Authentication middleware
│   │   ├── b2.ts              # Backblaze B2 client
│   │   ├── hash.ts             # Password hashing (SHA-256)
│   │   ├── jwt.ts              # JWT token handling
│   │   └── uuid.ts            # UUID generation
│   └── modules/                # Feature modules
│       ├── auth/               # User authentication (Personal / Organization)
│       ├── tasks/              # Task management
│       ├── waitlist/           # Waitlist management
│       ├── stores/             # File uploads (PDF to B2)
│       ├── dashboard/          # Dashboard overview
│       ├── ai/                 # AI chat assistant (Groq)
│       └── notification/       # Push notification subscriptions
├── packages/schemas/           # Zod validation schemas
├── migrations/                 # D1 database migrations
├── wrangler.jsonc              # Workers configuration
└── package.json
```

### Data Flow

```
Request → Routes → Controllers → Services → CRUD → Database (D1)
              ↓
         Zod Schemas (validation)
```

### Account Types

The API supports two account types:

- **Personal** — Standard user. Tasks and stores are scoped to the individual user.
- **Organization** — Organization user. Tasks and stores are shared across the organization. An organization row is auto-created on registration.

The `accountType` is determined at registration, embedded in JWT tokens, and checked by controllers to route to the correct table (personal vs organization).

### External Integrations

| Service | Purpose |
|---------|---------|
| Cloudflare D1 | SQLite database |
| Backblaze B2 | PDF file storage |
| Groq | AI chat (llama-3.3-70b-versatile) |
| Web Push API (VAPID) | Push notifications |

### Token Expiry

- Access Token: 40 minutes
- Refresh Token: 14 days (returned in response body)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `B2_APPLICATION_KEY_ID` | Yes | Backblaze B2 key ID |
| `B2_APPLICATION_KEY` | Yes | Backblaze B2 application key |
| `B2_BUCKET_NAME` | Yes | Backblaze B2 bucket name |
| `B2_ENDPOINT` | Yes | Backblaze B2 S3 endpoint |
| `B2_REGION` | Yes | Backblaze B2 region |
| `VAPID_PUBLIC_KEY` | Yes | VAPID public key for push notifications |
| `VAPID_PRIVATE_KEY` | Yes | VAPID private key for push notifications |
| `VAPID_SUBJECT` | Yes | VAPID subject (mailto:) |
| `GROQ_API_KEY_1` through `GROQ_API_KEY_5` | Yes | Groq API keys (rate-limit rotation) |

---

## API Endpoints

### Auth

Base path: `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | Refresh Token (Bearer) |

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "accountType": "Personal"
}
```
`accountType` can be `"Personal"` or `"Organization"` (defaults to `"Personal"`).

**Response (201)**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "john",
    "email": "john@example.com",
    "accountType": "Personal"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "john",
    "email": "john@example.com",
    "accountType": "Personal"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

#### Refresh
```bash
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

**Response (200)**
```json
{
  "message": "Token refreshed successfully",
  "user": {
    "id": "uuid",
    "username": "john",
    "email": "john@example.com",
    "accountType": "Personal"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### Tasks

Base path: `/api/tasks`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tasks/create-task` | Create task | Bearer Token |
| GET | `/tasks/get-tasks` | Get all tasks (paginated) | Bearer Token |
| GET | `/tasks/get-task/:id` | Get single task | Bearer Token |
| PUT | `/tasks/update-task/:id` | Update task | Bearer Token |
| PATCH | `/tasks/complete/:id` | Mark task as complete | Bearer Token |
| DELETE | `/tasks/delete-task/:id` | Delete task | Bearer Token |

Supports both Personal tasks (`tasks` table) and Organization tasks (`organizations_tasks` table) based on account type.

#### Create Task
```bash
POST /api/tasks/create-task
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Task title",
  "desc": "Task description",
  "startingDate": "2024-12-01T00:00:00Z",
  "deadline": "2024-12-31T00:00:00Z",
  "assignedTo": "user-id-uuid",
  "status": "Common"
}
```

`status` can be `"Common"` or `"Urgent"`.

**Response (201)** — Full task object with creator and assignee details.

#### Get Tasks (paginated)
```bash
GET /api/tasks/get-tasks?page=0
```
Returns 20 tasks per page.

#### Complete Task
```bash
PATCH /api/tasks/complete/:id
```
Also fires a push notification to all subscribed users.

---

### Waitlist

Base path: `/api/waitlist`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/waitlist/add-waitlist` | Add to waitlist | No |
| GET | `/waitlist/get-all-waitlist` | Get all waitlist entries | Bearer Token |

#### Add to Waitlist
```bash
POST /api/waitlist/add-waitlist
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "desc": "I'm interested in your product"
}
```

#### Get All Waitlist
```bash
GET /api/waitlist/get-all-waitlist
Authorization: Bearer <access_token>
```

---

### Stores

Base path: `/api/stores`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/stores/upload` | Upload PDF file | Bearer Token |
| GET | `/stores/get-stores` | Get all files | Bearer Token |
| GET | `/stores/download/:id` | Download/view PDF | Bearer Token |
| DELETE | `/stores/delete-store/:id` | Delete file | Bearer Token |

#### Upload
```bash
POST /api/stores/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <pdf_file>
fileName: "document.pdf"
organizationId: "org-uuid"  # optional, for org users
```
Max file size: 10MB. Stores file in Backblaze B2.

---

### Dashboard

Base path: `/api/dashboard`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/overview` | Get dashboard overview | Bearer Token |

Returns `{ pending, completed, overdue, stats }`. Organization users see org-wide data.

---

### AI Chat

Base path: `/api/ai`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/chat` | Send chat message (non-streaming) | Bearer Token |
| POST | `/ai/stream-chat` | Send chat message (streaming) | Bearer Token |
| DELETE | `/ai/clear-rate-limits` | Reset rate-limited API keys | Bearer Token |
| DELETE | `/ai/clear-session-cache` | Clear user session context | Bearer Token |

#### Chat
```bash
POST /api/ai/chat
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "What tasks do I have?" }
  ]
}
```
Powered by Groq (`llama-3.3-70b-versatile`). Has tool-calling for reading PDFs from stores. Uses 5 API keys with automatic rate-limit rotation.

---

### Notifications

Base path: `/api/notification`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/notification/subscribe` | Subscribe to push notifications | Bearer Token |
| POST | `/notification/send` | Send push notification to all subscribers | No |

#### Subscribe
```bash
POST /api/notification/subscribe
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

---

## Database Schema

### Users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  account_type TEXT DEFAULT 'Personal' CHECK(account_type IN ('Personal', 'Organization')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Tasks
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  desc TEXT,
  isCompleted INTEGER DEFAULT 0,
  createdBy TEXT REFERENCES users(id) ON DELETE SET NULL,
  assignedTo TEXT REFERENCES users(id) ON DELETE SET NULL,
  startingDate TEXT,
  deadline TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'Common' CHECK(status IN ('Urgent', 'Common'))
);
```

### Organizations
```sql
CREATE TABLE organizations (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Organization',
  is_admin INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Organization Tasks
```sql
CREATE TABLE organizations_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  desc TEXT,
  isCompleted INTEGER DEFAULT 0,
  createdBy TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignedTo TEXT REFERENCES users(id) ON DELETE SET NULL,
  startingDate TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Common',
  createdAt TEXT DEFAULT (datetime('now'))
);
```

### Stores
```sql
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  b2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  link TEXT,
  uploaded_at TEXT DEFAULT (datetime('now'))
);
```

### Organization Stores
```sql
CREATE TABLE organizations_stores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(user_id) ON DELETE CASCADE,
  b2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  link TEXT,
  uploaded_at TEXT DEFAULT (datetime('now'))
);
```

### Waitlist
```sql
CREATE TABLE waitlist (
  id TEXT PRIMARY KEY,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  desc TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Subscriptions (Push Notifications)
```sql
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
