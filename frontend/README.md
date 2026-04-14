# React + TypeScript + Vite + Tailwind CSS

This is the frontend application for Arcademia project.

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── api/
│   ├── api.ts          # Axios instance with interceptors
│   ├── hooks/          # Custom React hooks
│   └── queries/        # React Query hooks
├── components/
│   └── form.component.tsx  # Reusable form component
├── pages/
│   └── auth/
│       ├── login.pages.tsx
│       └── signup.pages.tsx
├── router.tsx          # TanStack Router configuration
├── App.tsx
└── main.tsx
```

## Features

### Form Component
Reusable form component with:
- Multiple field types: text, email, password, textarea, select, checkbox, radio, date, tel
- Built-in validation (required, minLength, maxLength, pattern, min, max)
- Real-time validation on blur
- Two layout modes: vertical and horizontal
- Custom button variants: primary, secondary, outline, danger, ghost
- Helper text and disabled states
- Form reset functionality

### Authentication Pages
- **Login** (`/login`) - Username/email and password fields
- **Sign Up** (`/register`) - Full registration form with firstName, lastName, email, username, password, confirmPassword, phone, dob, address

### Tailwind Configuration
Custom font sizes and font family:
- Font family: EB Garamond (heading and body)
- Font sizes: sm (0.750rem), base (1rem), xl (1.333rem), 2xl (1.777rem), 3xl (2.369rem), 4xl (3.158rem), 5xl (4.210rem)

### API Configuration
- Axios instance with request/response interceptors
- Automatic token injection from localStorage
- 401 handling with redirect to login

### Vite Proxy
- All `/api/*` requests are proxied to `http://localhost:3000`

## Dependencies

- `@tanstack/react-query` - Data fetching library
- `@tanstack/react-router` - Routing
- `axios@1.14.0` - HTTP client
- `tailwindcss` - Styling