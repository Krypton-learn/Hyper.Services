```txt
bun install
bun run dev
```

```txt
bun run deploy
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
│   ├── auth.schemas.ts
│   ├── auth.serivces.ts
│   └── auth.validators.ts
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
│   ├── orgs.schema.ts   # MongoDB schema
│   ├── orgs.services.ts
│   └── orgs.validators.ts
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

#### Create Task
```json
Request:
{
  "title": "Task title",
  "created_by": "user_id",
  "assigned_to": "user_id (optional)",
  "starting_date": "2024-01-01",
  "due_date": "2024-01-31",
  "status": "Upcoming",
  "team": ["user_id1", "user_id2"],
  "phase": "phase_id",
  "tempTeamMembers": ["user_id1"],
  "description": "Task description",
  "priority": "High"
}

Response:
{
  "message": "Task created successfully",
  "task": { ... }
}
```

#### Get All Tasks
```
GET /api/tasks/get/all?populate=created_by,assigned_to
```

#### Join Team (requires Authorization header)
```
Authorization: Bearer <access_token>

PATCH /api/tasks/join-team/:id
```

#### Reject Team Invitation (requires Authorization header)
```
Authorization: Bearer <access_token>

PATCH /api/tasks/reject-team/:id
```

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

Note: The founder is automatically set from the authenticated user's token and added to the admin array.

#### Update Organization (requires Authorization header)
```
Authorization: Bearer <access_token>

PATCH /api/orgs/edit/:id
```

Only the founder or admin can update the organization.

#### Delete Organization (requires Authorization header)
```
Authorization: Bearer <access_token>

DELETE /api/orgs/delete/:id
```

Only the founder can delete the organization.

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Returns "Hello Hono!" |
| GET | `/health` | Health check endpoint |

---

## Deploying to Cloudflare Workers

### Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- MongoDB Atlas database (Cloudflare Workers can't connect to local MongoDB)

### 1. Update Environment Variables for Cloudflare

Edit `wrangler.toml` or use Cloudflare Dashboard to add these secrets:

```bash
wrangler secret put MONGO_URI
# Enter your MongoDB Atlas connection string

wrangler secret put DB_NAME
# Enter your database name

wrangler secret put JWT_SECRET
# Enter your JWT secret
```

### 2. Build and Deploy

```bash
bun run deploy
# or
npm run deploy
```

### 3. Configure CORS (if needed)

```txt
bun run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
app.use('/*', async (c, next) => {
  await next()
  c.res.headers.set('Access-Control-Allow-Origin', '*')
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return c.res
})
```

### 4. Test Your Deployment

```bash
wrangler tail
```

Visit your Workers URL (e.g., `https://your-project.workers.dev/health`)

## Task Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Task title (required) |
| `created_by` | ObjectId | Reference to employee |
| `created_at` | Date | Creation timestamp |
| `assigned_to` | ObjectId | Assigned employee |
| `starting_date` | Date | Task start date |
| `due_date` | Date | Task due date |
| `status` | Enum | "Due", "Upcoming", "Completed" |
| `team` | ObjectId[] | Team members |
| `phase` | ObjectId | Reference to phase |
| `tempTeamMembers` | ObjectId[] | Pending team invitations |
| `description` | String | Task description |
| `priority` | Enum | "Low", "Medium", "High", "Urgent" |

## Organization Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Organization name (required) |
| `founder` | ObjectId | Reference to employee who created the org |
| `admin` | ObjectId[] | Array of admin user IDs (founder auto-added) |
| `departments` | String[] | List of department names |
| `created_at` | Date | Creation timestamp |
| `updated_at` | Date | Last update timestamp |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
