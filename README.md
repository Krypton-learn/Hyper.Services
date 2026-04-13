```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Tasks Module

### Schema Fields
- `title` - Task title (required)
- `created_by` - Reference to employee who created the task
- `created_at` - Timestamp of task creation
- `assigned_to` - Reference to assigned employee
- `starting_date` - Task start date
- `due_date` - Task due date
- `status` - Enum: "Due", "Upcoming", "Completed"

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/create` | Create a new task |
| GET | `/tasks/all` | Get all tasks |
| GET | `/tasks/:id` | Get task by ID |
| DELETE | `/tasks/:id` | Delete task by ID |
| PATCH | `/tasks/:id` | Update task by ID |

### Query Parameters
- `populate` - Populate referenced fields (e.g., `?populate=created_by,assigned_to`)

### Services
- `createTaskService` - Create a new task
- `getAllTaskService` - Get all tasks with optional population
- `getTaskByIdService` - Get task by ID with optional population
- `deleteTaskService` - Delete task by ID
- `editTaskService` - Update task fields
