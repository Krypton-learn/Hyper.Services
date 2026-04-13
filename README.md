```txt
bun install
bun run dev
```

```txt
bun run deploy
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

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
