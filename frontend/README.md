# Frontend

React + TypeScript frontend built with Vite, Tailwind CSS, TanStack Router, TanStack Query, and Zustand.

## Tech Stack

- **Build Tool**: Vite
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 3
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **State Management**: Zustand
- **Icons**: Lucide React
- **Avatar**: React Avatar
- **Notifications**: Sonner

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                # App entry point with QueryClient
│   ├── router.tsx              # TanStack Router configuration
│   ├── layout.tsx             # Main layout with sidebars
│   ├── App.tsx                # Root component
│   ├── index.css             # Tailwind imports
│   ├── api/
│   │   ├── client.ts         # Centralized API client (handles 401)
│   │   ├── auth.api.ts       # Auth API functions
│   │   ├── orgs.api.ts      # Organizations API
│   │   ├── tasks.api.ts     # Tasks API
│   │   └── milestones.api.ts # Milestones API
│   ├── components/
│   │   ├── Button.tsx       # Button component
│   │   ├── Card.tsx         # Card components
│   │   ├── Modal.tsx        # Modal component
│   │   ├── Table.tsx       # Table components
│   │   ├── Sidebar.tsx     # Sidebar with Zustand store
│   │   └── form/
│   │       └── Form.tsx    # Form components
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.pages.tsx
│   │   │   └── register.pages.tsx
│   │   └── orgs/
│   │       ├── OrgsPage.tsx
│   │       ├── OrgDashboardPage.tsx
│   │       ├── TasksPage.tsx
│   │       └── MilestonesPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts      # Auth hooks
│   │   ├── useOrgs.ts    # Organizations hooks (includes useJoinOrg)
│   │   ├── useTasks.ts   # Tasks hooks (includes milestones fetching)
│   │   └── useMilestones.ts # Milestones hooks (CRUD operations)
│   └── stores/
│       ├── auth.store.ts    # Auth state (persisted)
│       ├── orgs.store.ts  # Current org state (persisted)
│       ├── tasks.store.ts # Tasks state
│       └── milestones.store.ts # Milestones state
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page |
| `/login` | Login | Login page |
| `/register` | Register | Registration page |
| `/organizations` | Organizations | List user's organizations |
| `/organizations/dashboard` | Org Dashboard | Organization dashboard |
| `/organizations/tasks/$token` | Tasks | Tasks for organization |
| `/organizations/milestones` | Milestones | Milestones for organization |
| `/profile` | Profile | User profile |

## Authentication

- Tokens stored in localStorage via Zustand persist middleware
- API client automatically adds Authorization header
- On 401 response: clears auth and redirects to `/login`

### Auth Store

```typescript
import { useAuthStore } from './stores/auth.store'

const { user, accessToken, isAuthenticated, setAuth, logout } = useAuthStore()
```

### Org Store

```typescript
import { useOrgsStore } from './stores/orgs.store'

const { currentOrgId, currentOrgToken, currentOrg, setCurrentOrg, clearCurrentOrg } = useOrgsStore()
```

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## API Client

Centralized client at `src/api/client.ts`:

- Automatically adds Bearer token from auth store
- Handles 401 responses (logout + redirect)
- Base URL: `/api`

```typescript
import { apiClient } from './api/client'

// GET request
const response = await apiClient('/endpoint')

// POST request
const response = await apiClient('/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
})

// Request without auth
const response = await apiClient('/auth/login', {
  method: 'POST',
  body: JSON.stringify(data),
  requiresAuth: false,
})
```

## Data Fetching (TanStack Query)

### useTasks Hook

```typescript
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from './hooks/useTasks'

// Fetch tasks by token
const { data: tasks, isLoading, error } = useTasks(token)

// Create task
const createTaskMutation = useCreateTask(token)
await createTaskMutation.mutateAsync(taskData)

// Update task
const updateTaskMutation = useUpdateTask(token)
await updateTaskMutation.mutateAsync({ id, data: updateData })

// Delete task
const deleteTaskMutation = useDeleteTask(token)
await deleteTaskMutation.mutateAsync(id)
```

### useOrgs Hook

```typescript
import { useOrgs, useCreateOrg, useUpdateOrg, useDeleteOrg, useJoinOrg } from './hooks/useOrgs'

const { data: orgs, isLoading } = useOrgs()
const createOrgMutation = useCreateOrg()
const updateOrgMutation = useUpdateOrg()
const deleteOrgMutation = useDeleteOrg()
const joinOrgMutation = useJoinOrg()
```

### useMilestones Hook

```typescript
import { useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from './hooks/useMilestones'

// Fetch milestones for current org (uses currentOrgId from store)
const { data: milestones, isLoading } = useMilestones()

// Create milestone
const createMilestoneMutation = useCreateMilestone()
await createMilestoneMutation.mutateAsync(milestoneData)

// Update milestone
const updateMilestoneMutation = useUpdateMilestone()
await updateMilestoneMutation.mutateAsync({ id, data: updateData })

// Delete milestone
const deleteMilestoneMutation = useDeleteMilestone()
await deleteMilestoneMutation.mutateAsync(id)
```

## Components

### Button

```tsx
import { Button } from './components/Button'

<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button disabled={isPending}>Loading</Button>
```

### Modal

```tsx
import { Modal } from './components/Modal'

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Title">
  Content
</Modal>
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from './components/Table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
      <TableActions>Actions</TableActions>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
      <TableActions>
        <button>Action</button>
      </TableActions>
    </TableRow>
  </TableBody>
</Table>
```

### Form

```tsx
import { Form, FormField, FormLabel, FormInput, FormButton } from './components/form/Form'

<Form onSubmit={handleSubmit}>
  <FormField>
    <FormLabel htmlFor="email">Email</FormLabel>
    <FormInput id="email" type="email" />
  </FormField>
  <FormButton type="submit">Submit</FormButton>
</Form>
```

## Tailwind Custom Colors

Defined in `tailwind.config.js`:

```javascript
colors: {
  primary: '#9C19F9',
  secondary: '#F96F0B',
  background: '#F4F3F4',
  foreground: '#262832',
  muted: '#A399A7',
  accent: '#69988E',
}
```

## Environment

Backend runs on `http://localhost:8787`. Vite proxies `/api` requests to the backend.

```javascript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8787',
    changeOrigin: true,
  },
}
```