# Project Instructions

## Code Philosophy

**Prioritize simplicity, readability, and maintainability above all else.**

- **No overengineering**: Use the simplest solution that solves the problem. Avoid premature optimization, unnecessary abstractions, or complex patterns when straightforward code will do.
- **Clean, readable code**: Write code that is easy to understand at a glance. Prefer clarity over cleverness.
- **Industry standard**: Follow established best practices and conventions for the technologies in use.
- **Efficient solutions**: Choose performant approaches, but don't sacrifice readability for micro-optimizations.
- **DRY, but pragmatically**: Reuse code when it makes sense, but don't create abstractions until you have a proven need.
- **KISS (Keep It Simple, Stupid)**: Prefer simple, straightforward solutions over complex ones.
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features or abstractions until they're actually needed.
- **SOLID principles**: Follow SOLID principles for better code organization and maintainability.
- **Find all possible bugs**: When debugging or looking for errors, don't stop at the first issue you find. Keep digging until you've found all possible bugs.

## Project Overview

This is **freeMikvahCal**, a Mikvah (Jewish ritual bath) calendar tracking application that helps users track menstrual cycles and calculate important dates according to Jewish law.

### Technology Stack

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- Passport.js for authentication (Local + Google OAuth)
- Session-based authentication
- Winston for logging
- Joi for validation

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Mantine UI component library
- Zustand for state management
- React Router for routing
- FullCalendar for calendar display
- Axios for API calls

## File Structure

### Backend (`/backend`)
```
config/          - Configuration files (logger, passport, sessions)
controllers/     - Route handlers (auth, user, cycle, notification)
cronJobs/        - Scheduled tasks (cleanup, notification scheduling)
database/        - Database connection logic (MongoDB)
middleware/      - Express middleware (auth, validation, logging, rate limiting)
models/          - Mongoose schemas (Users, Cycles, Notifications, Preferences, ActivityLogs)
routes/          - API route definitions
services/        - Business logic layer (auth, user, cycle, notification)
utils/           - Helper functions and utilities
validation/      - Joi validation schemas
```

### Frontend (`/frontend/src`)
```
components/      - Reusable UI components (Navigation, ErrorCatching, etc.)
data/            - Static data (locations, etc.)
hooks/           - Custom React hooks (useAuth, useLoadEvents)
pages/           - Page components (home, calendar, login, register, etc.)
routing/         - Router setup and route guards
services/        - API client functions (authApi, userApi, cycleApi, notificationApi)
store/           - Zustand stores (userStore, cycleStore)
styles/          - Theme configuration
utils/           - Frontend utilities (axios config, notifications)
validationRules/ - Frontend Joi schemas
```

## Coding Standards

- **TypeScript**: Use proper typing on the frontend. Avoid `any` types.
- **Error handling**: Use try-catch blocks and proper error responses. Log errors appropriately.
- **Validation**: Validate all user input on both frontend and backend.
- **Security**: Never expose sensitive data. Use secure session management. Sanitize database inputs.
- **Naming**: Use clear, descriptive names for variables, functions, and files.
- **Comments**: Write comments only when the code's purpose isn't immediately clear. Prefer self-documenting code.
- **File organization**: Keep related code together. Follow the established folder structure.

## Key Business Logic

- Tracks menstrual cycles with start dates
- Calculates separation periods and Mikvah dates based on Jewish law
- Supports Hebrew calendar integration via @hebcal/core
- Provides notifications for important dates
- User preferences for locations and notification settings
