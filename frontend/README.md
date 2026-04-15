# Arcademia - Frontend Application

A React + TypeScript + Vite + Tailwind CSS frontend application for task management.

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Toasts**: Sonner
- **Validation**: Zod

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`

## Project Structure

```
src/
├── api/
│   ├── api.ts          # Axios instance with interceptors
│   └── tasks.api.ts    # Tasks API client
├── components/
│   ├── form.component.tsx    # Reusable form component
│   ├── modal.component.tsx   # Reusable modal component
│   └── table.component.tsx   # Reusable table component
├── hooks/
│   └── useLogin.ts     # Login mutation hook
├── lib/
│   ├── schemas.ts      # Zod schemas for validation
│   └── types.ts        # TypeScript types
├── pages/
│   ├── auth/
│   │   ├── login.pages.tsx
│   │   ├── signup.pages.tsx
│   │   └── interests.pages.tsx
│   ├── profile.pages.tsx
│   └── tasks.pages.tsx
├── router.tsx          # TanStack Router configuration
├── rootComponent.tsx   # Root layout with Toaster
└── main.tsx
```

## Features

### Components

**Form Component** (`form.component.tsx`)
- Multiple field types: text, email, password, textarea, select, checkbox, radio, date, tel, url
- Built-in validation (required, minLength, maxLength, pattern, min, max)
- Real-time validation on blur
- Two layout modes: vertical and horizontal
- Custom button variants: primary, secondary, outline, danger, ghost
- Helper text and disabled states
- Form reset functionality
- Initial values support

**Modal Component** (`modal.component.tsx`)
- Open/close state management
- Title and description
- Size options: sm, md, lg, xl
- Escape key to close
- Click outside to close
- Body scroll lock when open

**Table Component** (`table.component.tsx`)
- Configurable columns with custom render support
- Title and description header
- Loading state
- Empty state with custom message
- Row click handler
- Hover effects

### Pages

**Login Page** (`/login`)
- Email or username login
- Form validation with Zod
- Loading state on submit
- Toast notifications for success/error
- Navigate to dashboard on success

**Sign Up Page** (`/register`)
- Full registration form
- Validation for all fields

**Tasks Page** (`/tasks`)
- Table view of all tasks
- Populate checkboxes (Created By, Assigned To)
- Add Task modal with form
- Edit Task modal with pre-filled form
- Delete confirmation modal
- Actions column with edit/delete buttons
- Toast notifications

**Profile Page** (`/profile`)
- View and edit user profile
- Read-only username and email

### API Integration

- Axios instance with request/response interceptors
- Automatic token injection from localStorage
- 401 handling with redirect to login
- API clients for tasks with CRUD operations

### Vite Proxy

All `/api/*` requests are proxied to `http://localhost:3000` in development.

## Shared Schemas

The frontend uses Zod schemas from `src/lib/schemas.ts` that mirror the backend schemas in `packages/schemas/`:

```typescript
import { createTaskSchema, updateTaskSchema, loginSchema, registerSchema } from '../lib/schemas'
```

## Dependencies

- `@tanstack/react-query` - Data fetching library
- `@tanstack/react-router` - Routing
- `axios` - HTTP client
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `zod` - Schema validation

## Building for Production

```bash
npm run build
```

Output is in the `dist` folder.