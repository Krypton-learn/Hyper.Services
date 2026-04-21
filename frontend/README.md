# Frontend

React + TypeScript frontend built with Vite 7.3, Tailwind CSS 3, TanStack Router, TanStack Query, and Zustand.

## Tech Stack

- **Build Tool**: Vite 7.3
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 3
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **State Management**: Zustand
- **Icons**: Lucide React
- **Avatar**: React Avatar

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                  # App entry point
│   ├── router.tsx               # TanStack Router configuration
│   ├── layout.tsx               # Main layout with sidebars
│   ├── index.css                # Tailwind imports
│   ├── components/
│   │   ├── Card.tsx            # Card components
│   │   ├── Sidebar.tsx          # Sidebar with Zustand store
│   │   └── form/
│   │       └── Form.tsx        # Form components (input, button, label, etc.)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.pages.tsx   # Login page
│   │   │   └── register.pages.tsx # Register page
│   │   └── profile.tsx          # Profile page
│   └── store/
│       └── auth.ts             # Auth store (Zustand)
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json
```

## Routes

| Path | Page | Layout |
|------|------|--------|
| `/` | Dashboard | Yes (with sidebar) |
| `/login` | Login | No |
| `/register` | Register | No |
| `/organizations` | Organizations | Yes |
| `/profile` | Profile | Yes |
| `/settings` | Settings | Yes |
| `/tasks` | Tasks | Yes |
| `/milestones` | Milestones | Yes |

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

## Components

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/Card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Form

```tsx
import { Form, FormField, FormLabel, FormInput, FormButton, FormError } from './components/form/Form'

<Form onSubmit={handleSubmit}>
  <FormField>
    <FormLabel htmlFor="email">Email</FormLabel>
    <FormInput id="email" type="email" />
  </FormField>
  <FormField>
    <FormLabel htmlFor="password">Password</FormLabel>
    <FormInput id="password" type="password" showPasswordToggle />
  </FormField>
  <FormError>Error message</FormError>
  <FormButton type="submit" variant="primary">Submit</FormButton>
</Form>
```

FormButton variants: `primary`, `secondary`, `outline`, `ghost`, `danger`

### Sidebar (Right Panel)

```tsx
import { useSidebarStore } from './components/Sidebar'

const { openRightSidebar, closeRightSidebar } = useSidebarStore()

openRightSidebar(<Component />, { width: 'w-96' })
closeRightSidebar()
```

## State Management (Zustand)

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

## Data Fetching (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query'

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['myData'],
    queryFn: () => fetch('/api/data').then(res => res.json()),
  })
}
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