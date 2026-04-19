# Hyper Revise

A Cloudflare Workers API built with Hono, D1, and JWT authentication.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: D1 (Cloudflare SQL)
- **Validation**: Zod
- **Authentication**: JWT with access/refresh tokens

## Project Structure

```
src/
├── index.ts                 # Main app entry
├── lib/                    # Utility functions
│   ├── id.lib.ts          # generateId() - UUID generator
│   ├── jwt.lib.ts         # JWT utilities (sign, verify, refresh)
│   └── password.lib.ts    # hashPassword, verifyPassword
└── modules/
    ├── auth/              # Authentication module
    │   ├── auth.schema.ts     # Zod schemas (register, login)
    │   ├── auth.crud.ts      # Database operations
    │   ├── auth.services.ts  # Business logic
    │   ├── auth.controllers.ts # Request handlers
    │   └── auth.routes.ts    # Route definitions
    ├── orgs/               # Organizations module
    │   ├── orgs.schema.ts     # Zod schemas
    │   ├── orgs.crud.ts      # Database operations
    │   ├── orgs.services.ts  # Business logic
    │   ├── orgs.controllers.ts # Request handlers
    │   └── orgs.routes.ts    # Route definitions
    └── milestones/          # Milestones module
        ├── milestones.schema.ts # Zod schemas
        ├── milestones.crud.ts  # Database operations
        ├── milestones.services.ts # Business logic
        ├── milestones.controllers.ts # Request handlers
        └── milestones.routes.ts # Route definitions
```

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
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  starting_date TEXT,
  ending_date TEXT,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (returns access token + refresh cookie) |
| POST | `/auth/refresh` | Refresh access token using refresh cookie |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orgs/create-org` | Create organization (requires JWT) |
| GET | `/orgs/get-orgs/me` | Get user's organizations (requires JWT) |
| GET | `/orgs/get-org/:id` | Get organization with members (requires JWT) |
| POST | `/orgs/join-org` | Join organization by token (requires JWT) |
| PUT | `/orgs/edit-org/:id` | Update organization (requires JWT) |
| DELETE | `/orgs/remove-org/:id` | Remove organization (requires JWT) |

### Milestones

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/milestones/create-milestone` | Create milestone (org founder only) |
| POST | `/milestones/get-milestones` | Get org's milestones (org member) |
| PUT | `/milestones/edit-milestone/:id` | Update milestone (creator only) |
| DELETE | `/milestones/remove-milestone/:id` | Delete milestone (creator only) |

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

## Environment Variables

Add to `wrangler.toml`:

```toml
[vars]
JWT_SECRET = "your-secret-key"
```

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

### Refresh Token

```bash
curl -X POST http://localhost:8787/auth/refresh \
  -H "Cookie: refresh_token=eyJ..."
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

### Get User's Organizations

```bash
curl -X GET http://localhost:8787/orgs/get-orgs/me \
  -H "Authorization: Bearer <access_token>"
```

### Get Organization with Members

```bash
curl -X GET http://localhost:8787/orgs/get-org/<org_id> \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "org": {
    "id": "...",
    "token": "...",
    "name": "My Organization",
    "description": "A sample organization",
    "members": [
      {
        "id": "...",
        "isFounder": true,
        "isAdmin": true,
        "role": "Head",
        "user": {
          "id": "...",
          "name": "John Doe",
          "email": "user@example.com",
          "profile": null
        }
      }
    ]
  }
}
```

### Join Organization

```bash
curl -X POST http://localhost:8787/orgs/join-org \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "token": "<org_token>"
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
    "orgId": "<org_id>",
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
    "orgId": "org_...",
    "createdBy": "user_...",
    "createdAt": "2026-04-19T...",
    "startingDate": "2026-01-01T00:00:00Z",
    "endingDate": "2026-03-31T00:00:00Z"
  }
}
```

### Get Organization Milestones

```bash
curl -X POST http://localhost:8787/milestones/get-milestones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "orgToken": "<org_token>"
  }'
```

Response:
```json
{
  "milestones": [
    {
      "id": "mile_...",
      "name": "Q1 Goals",
      "description": "First quarter objectives",
      "budget": 5000,
      "category": "Planning",
      "orgId": "org_...",
      "createdAt": "2026-04-19T...",
      "startingDate": "2026-01-01T00:00:00Z",
      "endingDate": "2026-03-31T00:00:00Z",
      "createdBy": {
        "id": "user_...",
        "name": "John Doe",
        "email": "user@example.com",
        "profile": null
      }
    }
  ]
}
```

### Update Milestone

```bash
curl -X PUT http://localhost:8787/milestones/edit-milestone/<milestone_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Updated Name",
    "budget": 7500,
    "category": "Development"
  }'
```

### Delete Milestone

```bash
curl -X DELETE http://localhost:8787/milestones/remove-milestone/<milestone_id> \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "message": "Milestone deleted successfully"
}
```

## Token Details

- **Access Token**: 50 minutes expiry
- **Refresh Token**: 7 days expiry (HttpOnly cookie)

## License

MIT