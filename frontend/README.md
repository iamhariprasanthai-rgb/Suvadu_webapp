# Employee Separation Management System - Frontend

React TypeScript frontend for the Employee Separation Management System.

## Features

- Role-based dashboard and navigation
- Separation case management
- Checklist tracking with progress indicators
- Sign-off workflow management
- Handover scheduling
- User and department management (admin)
- Reports and analytics

## Tech Stack

- React 18.2.0 with TypeScript
- React Router DOM 6.20.1
- Zustand for state management
- Tailwind CSS 3.3.6
- React Hook Form 7.48.2
- Axios for API communication
- Headless UI & Heroicons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Modal.tsx
│   │   └── StatusBadge.tsx
│   ├── layout/          # Layout components
│   │   ├── AuthLayout.tsx
│   │   └── MainLayout.tsx
│   └── separation/      # Feature-specific components
│       ├── AssignSignoffModal.tsx
│       ├── ChecklistSection.tsx
│       ├── HandoverSection.tsx
│       └── SignoffSection.tsx
├── pages/
│   ├── auth/            # Authentication pages
│   ├── separations/     # Case management pages
│   ├── manager/         # Manager-specific pages
│   ├── admin/           # Admin pages
│   ├── DashboardPage.tsx
│   └── SettingsPage.tsx
├── services/            # API services
│   ├── api.ts           # Axios instance
│   ├── authService.ts
│   ├── separationService.ts
│   └── organizationService.ts
├── store/               # State management
│   └── authStore.ts     # Zustand auth store
├── types/               # TypeScript definitions
│   └── index.ts
├── App.tsx              # Main app with routing
├── index.tsx            # Entry point
└── index.css            # Global styles & Tailwind
```

## User Roles

| Role | Access Level |
|------|--------------|
| Employee | Own separation case |
| Direct Manager | Team separations, sign-offs |
| Department Manager | Department-wide access |
| Separation Manager | Full admin access |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
