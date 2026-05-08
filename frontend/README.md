# Hyper Revise - Frontend

A React-based task management dashboard with authentication, AI assistant, calendar integration, PDF file storage, push notifications, and dark mode.

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| **UI Framework** | React | 19 |
| **Language** | TypeScript | ~6.0 |
| **Build Tool** | Vite | 8 |
| **Routing** | TanStack Router | 1.x |
| **Server State** | TanStack React Query | 5.x |
| **Client State** | Zustand | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **HTTP Client** | Axios | 1.x |
| **Icons** | Lucide React | 1.x |
| **Toasts** | Sonner | 2.x |
| **Avatars** | React Avatar | 5.x |
| **Calendar** | FullCalendar (React, DayGrid, TimeGrid, Interaction) | 6.x |

## Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Layout.tsx           # Root layout — left NavSidebar + main content + right sidebar
│   ├── NavSidebar.tsx       # Primary navigation with links, user profile, and logout
│   ├── Sidebar.tsx          # Generic sidebar shell (left/right, closable)
│   ├── PageContainer.tsx    # Page wrapper with title, description, and action slot
│   ├── ProtectedRoute.tsx   # Auth guard — redirects unauthenticated users to /login
│   ├── EnableNotifications.tsx  # Auto-registers service worker and subscribes to push
│   ├── Modal.tsx            # Backdrop + animated modal dialog
│   ├── ConfirmModal.tsx     # Danger/warning confirmation dialog built on Modal
│   ├── Form.tsx             # Form primitives (Form, FormField, FormActions, Input, Textarea, Button)
│   ├── Table.tsx            # Table primitives (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
│   ├── TaskFormModal.tsx    # Create / Edit task modal form
│   ├── CommandsModal.tsx    # Command palette modal (Ctrl+.)
│   └── GlobalCreateTaskModal.tsx  # Quick-create task modal
├── pages/                   # Route pages
│   ├── Home.tsx             # Dashboard with task stats (total, pending, completed, overdue)
│   ├── Tasks.tsx            # Full task management — CRUD, completion toggle, table view
│   ├── AI.tsx               # AI chat assistant (Groq-powered, task/file queries)
│   ├── Calendar.tsx         # FullCalendar integration for visualising tasks
│   ├── Settings.tsx         # User settings (font, dark mode, etc.)
│   ├── Login.tsx            # Login page
│   ├── Register.tsx         # Registration page (Personal / Organization)
│   ├── Waitlist.tsx         # Waitlist management (Organization only)
│   └── Stores.tsx           # PDF file management (upload, view, delete)
├── hooks/                   # Custom React Query hooks
│   ├── api.ts               # Axios instance with JWT interceptor + auto-refresh
│   ├── useAuth.ts           # useLogin, useRegister, useLogout mutations
│   ├── useTasks.ts          # useTasks, useTask, useCreateTask, useUpdateTask, useCompleteTask, useDeleteTask
│   ├── useDashboard.ts      # useDashboard query (pending, completed, overdue, stats)
│   ├── useWaitlist.ts       # useWaitlist, useAddToWaitlist, useDeleteFromWaitlist
│   ├── useStores.ts         # useStores, useUploadStore, useDeleteStore
│   └── useAI.ts             # useAI chat mutation (non-streaming)
├── store/                   # Zustand state stores
│   ├── authStore.ts         # Auth state — user, accessToken, refreshToken, JWT persisted in localStorage
│   ├── tasksStore.ts        # Tasks list + selectedTask with CRUD actions
│   ├── dashboardStore.ts    # Dashboard data (pending, completed, overdue, stats)
│   ├── layoutStore.ts       # UI state — right sidebar open/close/disable
│   ├── fontStore.ts         # Theme preferences — font family + dark mode (persisted via zustand/persist)
│   ├── waitlistStore.ts     # Waitlist entries state
│   └── createTaskModalStore.ts  # Create task modal open/close state
├── lib/                     # Utility libraries
│   └── push.ts              # Push notification helpers (service worker, VAPID subscription)
├── router.tsx               # TanStack Router route tree with auth guard on protected routes
├── index.css                # Tailwind directives + CSS custom properties (light/dark themes)
└── main.tsx                 # App entry — React Query provider, auth initializer, theme applier, toaster
```

## Features

- **Authentication** — Login / Register with account type selection (Personal / Organization). JWT tokens stored in localStorage with automatic 401 interception and token refresh.
- **Dashboard** — Overview stats (total, pending, completed, overdue tasks) with categorized task lists.
- **Task Management** — Full CRUD with title, description, start date, deadline, assignee, status (Common/Urgent). Mark tasks as complete via API patch.
- **AI Chat Assistant** — Chat with a Groq-powered assistant that can answer questions about your tasks and stored files. Supports streaming responses.
- **Calendar View** — FullCalendar (day grid + time grid + interaction) for visualising tasks by date.
- **Stores** — PDF file management: upload (max 10MB), inline preview via iframe, and delete. Files stored in Backblaze B2.
- **Waitlist** — View and delete waitlist entries. Only visible for Organization account types.
- **Settings** — Configurable font family (Tomorrow / Poppins via Google Fonts) and dark mode toggle, persisted across sessions.
- **Push Notifications** — Service worker registration, VAPID-based push subscription, and in-app permission prompt on first load. Notifications fire when tasks are completed.
- **Dark Mode** — CSS custom property theming with `.dark` class toggling on `<html>`, with smooth background/color transitions.
- **Keyboard Shortcuts** — Ctrl+. (command palette), Ctrl+Alt+C (create common task), Ctrl+Alt+U (create urgent task), Ctrl+Alt+S (upload file), Ctrl+Alt+A (open AI chat with auto-ask).
- **Responsive Sidebar Layout** — Fixed left navigation sidebar + optional right detail panel, driven by Zustand layout store.
- **Toast Notifications** — Sonner-powered toasts that respect the current theme font.

## Routes

| Path | Page | Auth Required | Notes |
|---|---|---|---|
| `/` | Home (Dashboard) | ✅ | |
| `/tasks` | Task Management | ✅ | |
| `/ai` | AI Chat Assistant | ✅ | |
| `/calendar` | Calendar View | ✅ | |
| `/waitlist` | Waitlist | ✅ | Organization accounts only |
| `/stores` | Stores (PDFs) | ✅ | |
| `/settings` | Settings | ✅ | |
| `/login` | Login | ❌ | |
| `/register` | Register | ❌ | |

Protected routes redirect to `/login` when no valid JWT is found in localStorage. The `/waitlist` route is only accessible to Organization users (hidden from sidebar for Personal accounts).

## Design System

The app uses a **CSS custom property** design system configured through Tailwind:

- **Colors**: `--primary` (#9810fa), `--secondary` (#f77111), `--tertiary` (#00c758), with light and dark neutral/background variants.
- **Typography**: Tomorrow font family (Google Fonts) with a modular type scale (0.707rem → 5.652rem).
- **Dark mode**: Toggled via `.dark` class on `<html>`, swapping CSS custom property values.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## API Configuration

The frontend connects to a backend API at `http://localhost:8787/api` (configured via `VITE_API_URL` env var, default in `src/hooks/api.ts`). The Axios instance automatically:

1. Attaches the JWT `Authorization: Bearer <token>` header to every request.
2. Intercepts 401 responses and attempts a token refresh (via `/auth/refresh`).
3. If refresh fails, triggers a logout + state cleanup.
