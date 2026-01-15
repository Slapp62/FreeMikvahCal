# Full-Stack Application Architecture Template

## Document Purpose
This document describes the complete architecture and design patterns of the jobRocket application. Use this as a template to recreate a similar full-stack application with the same structure, patterns, and UI conventions for a different domain.

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Design Patterns](#database-design-patterns)
6. [Authentication & Authorization](#authentication--authorization)
7. [UI/UX Design System](#uiux-design-system)
8. [Key Patterns & Conventions](#key-patterns--conventions)
9. [Configuration & Environment](#configuration--environment)
10. [Testing Strategy](#testing-strategy)

---

## Technology Stack

### Frontend
- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite 7.x
- **UI Library**: Mantine UI 8.x
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router DOM v7
- **Form Handling**: React Hook Form with Joi validation
- **HTTP Client**: Axios
- **Icons**: Tabler Icons React
- **Animations**: Framer Motion
- **Date Handling**: date-fns, dayjs
- **Styling**: CSS Modules, Mantine's styling system

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Local & Google OAuth 2.0)
- **Session Management**: express-session with connect-mongo
- **Validation**: Joi
- **Security**: Helmet, CORS, express-mongo-sanitize, express-rate-limit
- **File Upload**: Multer with Cloudinary
- **Logging**: Winston with morgan
- **Cron Jobs**: node-cron
- **Password Hashing**: bcrypt
- **AI/ML**: OpenAI API (for embeddings/recommendations)

### Development & Testing
- **Frontend Testing**: Vitest, Testing Library
- **Backend Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier, Stylelint
- **Type Safety**: TypeScript (frontend), JSDoc (backend)

---

## Project Structure

### Root Directory Layout
```
project-root/
├── frontend/              # React frontend application
├── backend/               # Express backend application
├── docs/                  # Documentation
├── README.md
└── .gitignore
```

### Frontend Structure (`/frontend`)
```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AI_Components/      # AI/ML-related components
│   │   ├── Buttons/            # Button components
│   │   ├── ComponentStyles/    # Component-specific styles
│   │   ├── CookieBanner/       # Cookie consent
│   │   ├── EmptyState/         # Empty state displays
│   │   ├── ErrorCatching/      # Error boundaries
│   │   ├── Filters/            # Filter components
│   │   ├── ListingActions/     # Actions for listings
│   │   ├── ListingComponents/  # Listing display components
│   │   ├── Modals/             # Modal dialogs
│   │   └── Navigation/         # Navigation components
│   ├── context/          # React context providers
│   ├── data/             # Static data, constants
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components (route targets)
│   │   ├── AdminControls/
│   │   ├── AllUsers/
│   │   ├── BusinessUsers/
│   │   ├── EditProfilePage/
│   │   ├── HomePage/
│   │   ├── Jobseekers/
│   │   └── Static/
│   ├── routing/          # Routing configuration
│   │   ├── AppRouter.tsx
│   │   ├── Layout.tsx
│   │   └── RouteGuard.tsx
│   ├── store/            # Redux store configuration
│   │   ├── store.ts
│   │   └── userSlice.tsx
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions
│   │   ├── axiosConfig.ts
│   │   ├── sessionManager.ts
│   │   └── analytics.ts
│   ├── validationRules/  # Frontend validation schemas (Joi)
│   ├── SEO/              # SEO components
│   ├── test-utils/       # Testing utilities
│   ├── App.tsx           # Root App component
│   ├── main.tsx          # Application entry point
│   ├── theme.ts          # Mantine theme configuration
│   └── Types.ts          # TypeScript type definitions
├── package.json
├── vite.config.mjs
├── tsconfig.json
└── eslint.config.js
```

### Backend Structure (`/backend`)
```
backend/
├── config/              # Configuration files
│   ├── logger.js        # Winston logger config
│   ├── passport.js      # Passport authentication strategies
│   └── sessionConfig.js # Express session config
├── controllers/         # Request handlers
│   ├── applicationsController.js
│   ├── listingController.js
│   ├── recommendationController.js
│   └── userController.js
├── cronJobs/           # Scheduled tasks
│   ├── listingDeletion.js
│   └── userDeletion.js
├── data/               # Static data, constants
│   ├── workArr.js
│   ├── israelCities.js
│   └── industries.js
├── database/           # Database connection
│   ├── dbService.js
│   └── mongoDB/
│       ├── connectLocally.js
│       ├── connectAtlas.js
│       └── connectTest.js
├── middleware/         # Express middleware
│   ├── authMiddleware.js
│   ├── rateLimiter.js
│   ├── userValidation.js
│   ├── listingValidation.js
│   ├── applicationValidation.js
│   ├── multer.js
│   └── logging/
│       ├── httpLogger.js
│       └── errorLogger.js
├── migrations/         # Database migrations
├── models/             # Mongoose schemas
│   ├── Users.js
│   ├── Listings.js
│   ├── Applications.js
│   └── AnalyticsEvent.js
├── public/             # Static files (built frontend)
├── routes/             # API routes
│   ├── main.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── listingRoutes.js
│   ├── applicationRoutes.js
│   ├── recommendationRoutes.js
│   └── analyticsRoutes.js
├── scripts/            # Utility scripts
│   └── copy-build.js
├── seeding/            # Database seeding
│   ├── seedingDataService.js
│   └── seedingData/
├── services/           # Business logic
│   ├── analyticsService.js
│   ├── applicationsService.js
│   ├── authService.js
│   ├── embeddingService.js
│   ├── filterService.js
│   ├── listingService.js
│   ├── matchingService.js
│   ├── recommendationService.js
│   └── userService.js
├── tests/              # Test suites
│   ├── setup.js
│   ├── helpers/
│   ├── users/
│   ├── applications/
│   └── cronJobs/
├── utils/              # Utility functions
│   ├── bcrypt.js
│   ├── functionHandlers.js
│   ├── normalizeResponses.js
│   ├── uploadResumeToCloudinary.js
│   └── logHelpers.js
├── validation/         # Validation schemas
│   └── Joi/
│       ├── joiUserSchema.js
│       ├── joiListingSchema.js
│       ├── joiLoginSchema.js
│       └── applicationSchema.js
├── app.js              # Express app configuration
├── index.js            # Application entry point
├── package.json
└── eslint.config.js
```

---

## Frontend Architecture

### Entry Point Flow
1. **`main.tsx`** - Application bootstrap
   - Imports global axios configuration
   - Initializes session management
   - Wraps app in ErrorBoundary
   - Renders root App component

2. **`App.tsx`** - Root component
   - Sets up MantineProvider with theme
   - Configures Notifications component
   - Wraps app in Redux Provider
   - Wraps app in PersistGate for Redux persistence
   - Renders AppRouter
   - Initializes Google Analytics
   - Sets up global error handlers

### Routing Architecture
**File**: `routing/AppRouter.tsx`

- Uses React Router v7 with `createBrowserRouter`
- Implements route-based code splitting with `lazy()` imports
- Uses `<Suspense>` with loading fallback for lazy routes
- Eager loads frequently accessed pages (HomePage, LoginPage)
- Lazy loads large/infrequent pages (Dashboard, Admin, Static pages)
- **Layout component** provides consistent structure across routes
- **RouteGuard component** protects authenticated/role-specific routes

**Route Protection Pattern**:
```tsx
{
  path: 'dashboard',
  element: (
    <RouteGuard profileType="business">
      <Suspense fallback={<PageLoader />}>
        <Dashboard />
      </Suspense>
    </RouteGuard>
  ),
}
```

### State Management
**Files**: `store/store.ts`, `store/userSlice.tsx`

- **Redux Toolkit** for centralized state
- **Redux Persist** for state persistence in localStorage
- Whitelist pattern to persist only specific slices
- Disable serializable check for redux-persist compatibility

**Store Structure**:
```typescript
store/
  userSlice: {
    // User authentication state
    // User profile data
    // Session information
  }
```

**Pattern**:
- Create slices with `createSlice()`
- Use `createAsyncThunk()` for async actions
- Combine reducers with `combineReducers()`
- Persist specific slices with whitelist

### Component Organization

#### By Feature
Components are organized by feature/domain:
- **User-facing features**: `AllUsers/`, `Jobseekers/`, `BusinessUsers/`
- **Admin features**: `AdminControls/`
- **Static content**: `Static/`

#### By Type (Shared Components)
- **UI primitives**: `Buttons/`, `Modals/`, `EmptyState/`
- **Feature components**: `Filters/`, `ListingComponents/`, `ListingActions/`
- **Infrastructure**: `ErrorCatching/`, `Navigation/`, `CookieBanner/`

#### Component Pattern
Each major page typically follows:
```
PageFolder/
├── PageName.pages.tsx       # Main page component
├── usePageName.ts            # Custom hook for page logic
├── components/               # Page-specific components
└── styles/                   # Page-specific styles
```

### Custom Hooks
**Location**: `hooks/`

Common patterns:
- **Data fetching**: `UseGetAllUser.ts`
- **Session management**: `useSessionRestore.ts`
- **UI behavior**: `useScrollToTop.ts`

### Form Handling
- **React Hook Form** for form state
- **Joi** validation schemas in `validationRules/`
- **@hookform/resolvers** for Joi integration
- Mantine form components for UI

**Pattern**:
```typescript
const schema = Joi.object({...});
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: joiResolver(schema)
});
```

### HTTP Client Configuration
**File**: `utils/axiosConfig.ts`

- Global axios defaults
- `withCredentials: true` for session cookies
- Dynamic base URL (dev vs production)
- Imported at app entry to apply globally

**Session Management**: `utils/sessionManager.ts`
- Axios interceptors for 401/410 responses
- Automatic session expiration handling
- Centralized logout logic
- Prevents cascading error states

### Error Handling
**Components**: `ErrorCatching/ErrorBoundary.tsx`, `ErrorCatching/ErrorFallback.tsx`

- React Error Boundaries at app root
- Global error handlers for uncaught errors
- Unhandled promise rejection handlers
- Integration with analytics for error tracking

---

## Backend Architecture

### Application Bootstrap Flow
1. **`index.js`** - Entry point
   - Load environment variables (dotenv)
   - Connect to database FIRST (required for session store)
   - Load Express app (app.js)
   - Seed development data (if NODE_ENV=development)
   - Start server on specified port
   - Comprehensive error logging

2. **`app.js`** - Express configuration
   - Apply security middleware (helmet, CORS, CSP)
   - Configure session with MongoDB store
   - Initialize Passport authentication
   - Apply sanitization (mongo-sanitize)
   - Mount API routes
   - Serve static frontend (production)
   - Schedule cron jobs
   - Global error handler

### Middleware Stack
Applied in order:
1. **Helmet** - Security headers
2. **Trust proxy** (production) - For proxied environments
3. **CORS** - Cross-origin requests (development)
4. **HTTP logging** (Morgan → Winston)
5. **Body parser** (express.json)
6. **Content Security Policy** - Custom CSP headers
7. **Session** (express-session + connect-mongo)
8. **Passport** - Authentication
9. **Mongo sanitize** - NoSQL injection prevention
10. **Route-specific middleware** (auth, validation, rate limiting)

### Routing Pattern
**File**: `routes/main.js`

Central router that mounts sub-routers:
```javascript
router.use('/api/users', userRouter);
router.use('/api/listings', listingRouter);
router.use('/api/applications', applicationRouter);
router.use('/api/recommendations', recommendationRouter);
router.use('/api/analytics', analyticsRouter);
```

**Route File Pattern**:
```javascript
const router = Router();

// Apply middleware
router.use(middleware1);
router.use(middleware2);

// Define routes with specific middleware
router.get('/', [authenticateUser], controller.getAll);
router.post('/', [authenticateUser, validate], controller.create);
router.put('/:id', [authenticateUser, authorize], controller.update);
router.delete('/:id', [authenticateUser, authorize], controller.delete);

module.exports = router;
```

### Controller Pattern
**Location**: `controllers/`

Controllers are thin layers that:
1. Extract data from request
2. Call service layer
3. Return response with appropriate status

**Example**:
```javascript
const controllerFunction = async (req, res, next) => {
  try {
    const data = await service.doOperation(req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
```

### Service Layer Pattern
**Location**: `services/`

Services contain business logic:
- Database operations
- Data transformation
- External API calls
- Complex calculations
- Error throwing with custom messages

**Example**:
```javascript
const serviceFunction = async (data) => {
  // Validate business rules
  if (!condition) {
    throwError(400, 'Custom error message');
  }

  // Perform database operation
  const result = await Model.findOne(query);

  // Transform and return
  return normalizeResponse(result);
};
```

### Authentication Architecture
**Files**:
- `config/passport.js` - Passport strategies
- `middleware/authMiddleware.js` - Auth middleware
- `routes/authRoutes.js` - Auth endpoints
- `services/authService.js` - Auth logic

**Session-Based Authentication**:
- Express-session with MongoDB store
- Session stored in `req.session`
- User data attached to `req.user` by middleware
- 1-hour inactivity timeout with sliding window

**Dual Authentication Methods**:
1. **Email/Password** - bcrypt hashing
2. **Google OAuth 2.0** - Passport Google Strategy

**Separate Registration & Login Strategies**:
- `google` strategy for login
- `google-register` strategy for registration
- Prevents account confusion and provides clear error messages

### Authorization Patterns
**Middleware**: `middleware/authMiddleware.js`

Multiple authorization levels:
1. **`authenticateUser`** - Requires valid session
2. **`optionalAuthenticateUser`** - Session optional, sets user if exists
3. **`adminAuth`** - Requires admin role
4. **`businessAuth`** - Requires business profile type
5. **`userAdminAuth`** - User owns resource OR is admin
6. **`listingCreatorAuth`** - User created the listing
7. **`listingCreatorAdminAuth`** - User created listing OR is admin
8. **`lockoutCheck`** - Checks for account lockout
9. **`verifyCredentials`** - Validates email/password

**Authorization Chaining Pattern**:
```javascript
router.put('/:id',
  [authenticateUser, businessAuth, listingCreatorAuth],
  controller.update
);
```

### Validation Pattern
**Locations**: `validation/Joi/`, `middleware/*Validation.js`

**Two-Layer Validation**:
1. **Joi Schemas** - Define validation rules
2. **Middleware** - Apply schemas to routes

**Joi Schema Pattern**:
```javascript
const schema = joi.object({
  field: joi.string().min(2).max(100).required(),
  nested: joi.object({
    subfield: joi.string().valid('option1', 'option2')
  }).when('condition', {
    is: 'value',
    then: joi.required(),
    otherwise: joi.forbidden()
  })
});
```

**Validation Middleware Pattern**:
```javascript
const validate = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
```

### Error Handling
**Utilities**: `utils/functionHandlers.js`

**Custom Error Functions**:
```javascript
// Throw error (for services)
throwError(statusCode, message);

// Pass error to next middleware (for controllers)
nextError(next, statusCode, message);

// Handle error response (for global handler)
handleError(res, statusCode, message);
```

**Global Error Handler** (in `app.js`):
```javascript
app.use((error, req, res, next) => {
  // Log error with context
  logger.error('Error', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    userId: req.user?._id
  });

  // Send response
  handleError(res, error.status || 500, error.message);
});
```

### Logging Architecture
**Files**:
- `config/logger.js` - Winston configuration
- `middleware/logging/httpLogger.js` - HTTP request logging
- `middleware/logging/errorLogger.js` - Error logging
- `utils/logHelpers.js` - Structured logging helpers

**Winston Logger**:
- Daily rotating file transport
- Separate files for errors
- JSON format for log aggregation
- Console transport for development

**Logging Helpers**:
```javascript
logAuth(action, userId, metadata);      // Authentication events
logDatabase(operation, model, metadata); // Database operations
logSecurity(eventType, metadata);        // Security events
logError(error, context);                // Errors with context
logExternalAPI(service, operation, metadata); // External API calls
```

### File Upload Pattern
**Files**: `middleware/multer.js`, `utils/uploadResumeToCloudinary.js`

1. **Multer** - Memory storage for file buffer
2. **Cloudinary** - Cloud storage for uploaded files
3. **Error handling** - Network error detection and retry logic

### Scheduled Tasks (Cron Jobs)
**Location**: `cronJobs/`

- **node-cron** for scheduling
- Jobs registered in `app.js`
- Examples:
  - Expired listing cleanup
  - User account deletion (30-day grace period)

**Pattern**:
```javascript
const cron = require('node-cron');

const scheduleTask = () => {
  cron.schedule('0 0 * * *', async () => {
    // Daily task
    await performCleanup();
  });
};

module.exports = { scheduleTask };
```

---

## Database Design Patterns

### Technology
- **MongoDB** - NoSQL document database
- **Mongoose** - ODM for schema validation and queries
- **Environment-Based Connection**:
  - Development: Local MongoDB
  - Production: MongoDB Atlas
  - Testing: In-memory or test database

### Schema Design Patterns

#### Embedded Documents
Use for one-to-one or one-to-few relationships where subdocuments are always accessed with parent.

**Example** (Users model):
```javascript
{
  email: String,
  jobseekerProfile: {
    firstName: String,
    lastName: String,
    skills: [String],
    // ... more fields
  },
  businessProfile: {
    companyName: String,
    location: {
      country: String,
      region: String,
      city: String
    },
    // ... more fields
  }
}
```

#### Discriminated Union Pattern
Multiple profile types on single user document with conditional validation:
```javascript
profileType: { type: String, enum: ['jobseeker', 'business', 'admin'] },
jobseekerProfile: {
  firstName: {
    required() { return this.profileType === 'jobseeker'; }
  }
}
```

#### References
Use for one-to-many or many-to-many relationships.

**Example**:
```javascript
{
  businessId: { type: Schema.Types.ObjectId, ref: 'Users' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Users' }]
}
```

#### Computed Fields
Fields with default functions:
```javascript
{
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  }
}
```

#### Indexing Strategy
1. **Single Field Indexes** - For frequent queries
   ```javascript
   { businessId: { type: ObjectId, index: true } }
   ```

2. **Text Search Index** - For full-text search with weights
   ```javascript
   schema.index({
     title: 'text',
     description: 'text'
   }, {
     weights: { title: 10, description: 5 }
   });
   ```

3. **Unique Indexes** - For uniqueness constraints
   ```javascript
   { email: { type: String, unique: true } }
   ```

4. **Sparse Indexes** - For optional unique fields
   ```javascript
   { googleId: { type: String, unique: true, sparse: true } }
   ```

#### Validation Patterns

**Built-in Validators**:
```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/regex/, 'Error message']
  }
}
```

**Custom Validators**:
```javascript
schema.pre('validate', function(next) {
  if (!this.password && !this.googleId) {
    next(new Error('User must have either password or Google account'));
  }
  next();
});
```

**Conditional Validation**:
```javascript
schema.pre('validate', function(next) {
  if (this.apply && this.apply.method) {
    const count = Object.values(this.apply.method).filter(Boolean).length;
    if (count !== 1) {
      this.invalidate('apply.method', 'Exactly one method must be selected');
    }
  }
  next();
});
```

#### Middleware (Hooks)

**Pre-save Hook Example**:
```javascript
schema.pre('save', async function(next) {
  if (this.isModified('field') || this.isNew) {
    // Perform operation (e.g., generate embedding)
    this.computedField = await computeValue(this);
  }
  next();
});
```

#### Soft Delete Pattern
```javascript
{
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}

// In service:
const softDelete = async (id) => {
  await Model.findByIdAndUpdate(id, {
    isDeleted: true,
    deletedAt: new Date()
  });
};
```

#### Privacy/GDPR Compliance
- **Consent tracking** with timestamps, IP, user agent
- **Data export** functionality
- **Data anonymization** on deletion
- **Soft delete** with grace period

**Example**:
```javascript
consents: {
  dataProcessing: {
    granted: { type: Boolean, required: true },
    timestamp: { type: Date, required: true },
    ipAddress: String,
    userAgent: String
  }
}
```

### Response Normalization
**File**: `utils/normalizeResponses.js`

Transform database documents to consistent API responses:
- Remove sensitive fields (password, internal IDs)
- Flatten nested structures if needed
- Add computed fields
- Consistent field naming

---

## Authentication & Authorization

### Authentication Methods

#### 1. Email/Password Authentication
**Flow**:
1. User submits credentials
2. `lockoutCheck` middleware checks for account lockout
3. `verifyCredentials` middleware validates credentials
4. Service increments login attempts on failure
5. After 5 failed attempts: 30-minute lockout
6. On success: Create session, reset attempts

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Hashing**: bcrypt with auto-generated salt

#### 2. Google OAuth 2.0
**Strategies**:
- **Login Strategy** (`google`):
  - Checks if Google ID exists
  - Returns error if email registered with password
  - Returns error if no account exists

- **Registration Strategy** (`google-register`):
  - Checks for existing accounts
  - Returns Google profile data
  - Controller completes registration with additional fields

**Flow**:
```
Frontend → /api/auth/google/register → Google → Callback → Session → Redirect
```

### Session Management

**Configuration**: `config/sessionConfig.js`
```javascript
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient()
  }),
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}
```

**Session Data**:
```javascript
req.session.userId
req.session.isAdmin
req.session.profileType
req.session.lastActivity  // For inactivity timeout
```

**Inactivity Timeout**:
- 1-hour sliding window
- Updated on each authenticated request
- Returns 410 status on expiration (triggers frontend logout)

### Authorization Levels

1. **No Authentication** - Public routes
2. **Optional Authentication** - User data if available
3. **Authenticated User** - Any logged-in user
4. **Role-Based** - Specific profile type (business, jobseeker, admin)
5. **Resource Owner** - User owns the resource
6. **Resource Owner or Admin** - Owner or admin override

### Frontend Route Protection
**Component**: `routing/RouteGuard.tsx`

```typescript
<RouteGuard profileType="business">
  <Component />
</RouteGuard>
```

**Features**:
- Checks authentication status
- Validates profile type
- Redirects unauthenticated users to login
- Redirects unauthorized users to home

### Security Measures

1. **Password Security**:
   - bcrypt hashing
   - Never store plain passwords
   - Strength validation

2. **Session Security**:
   - HttpOnly cookies
   - Secure flag in production
   - SameSite: lax
   - Short-lived with sliding window

3. **Brute Force Protection**:
   - Login attempt tracking
   - Progressive lockout
   - Rate limiting

4. **Input Validation**:
   - Server-side validation (Joi)
   - Client-side validation (Joi)
   - Mongo sanitization

5. **Security Headers**:
   - Helmet middleware
   - Custom CSP policy
   - CORS configuration

6. **Logging**:
   - Authentication events
   - Authorization failures
   - Security incidents

---

## UI/UX Design System

### Design Library
**Mantine UI 8.x** - React component library with:
- Built-in theming system
- Dark mode support
- Comprehensive component set
- Accessible by default
- CSS-in-JS with CSS variables

### Theme Configuration
**File**: `frontend/src/theme.ts`

#### Custom Color Palettes
Each palette has 10 shades (0-9):
- **0-2**: Light shades (backgrounds, hover states)
- **3-5**: Medium shades (default states)
- **6**: Primary brand color
- **7-9**: Dark shades (emphasis, text)

**Palettes**:
1. **Primary** (`rocketOrange`): Main brand color
2. **Accent** (`rocketRed`): Secondary brand color
3. **Highlight** (`rocketYellow`): Tertiary/highlight color
4. **Neutrals** (`rocketGray`): Backgrounds and UI elements
5. **Dark** (`rocketBlack`): Dark mode backgrounds and light mode text

#### Theme Configuration
```typescript
export const theme = createTheme({
  primaryColor: 'rocketOrange',
  colors: { rocketOrange, rocketRed, rocketYellow, rocketGray, rocketBlack },

  // Typography
  fontFamily: 'Poppins, Inter, Roboto, sans-serif',
  fontSizes: { xs: '12px', md: '16px' },
  headings: { fontFamily: 'Poppins, sans-serif' },

  // Borders
  defaultRadius: 'md',

  // Automatic contrast
  autoContrast: true,

  // Component defaults
  components: { ... }
});
```

### Custom Component Variants
Extend Mantine components with custom variants:

**Button Variants**:
- **`rocketFilled`**: Primary brand color, solid
- **`rocketOutline`**: Transparent with border
- **`rocketSubtle`**: Transparent, hover effect
- **`rocketLight`**: Light background

**Badge Variants**:
- **`rocketBadge`**: Neutral badge for tags
- **`rocketStatus`**: Colored border for status

**ActionIcon Variant**:
- **`rocketAction`**: Transparent with hover

**Implementation Pattern**:
```typescript
Button: Button.extend({
  defaultProps: {
    radius: 'md',
    fw: 400,
    color: 'rocketOrange'
  },
  vars: (theme, props) => {
    if (props.variant === 'rocketFilled') {
      return {
        root: {
          '--button-bg': theme.colors.rocketOrange[6],
          '--button-hover': theme.colors.rocketOrange[8],
          '--button-color': theme.white
        }
      };
    }
    return { root: {} };
  }
})
```

### Dark Mode Support
- **Storage**: LocalStorage with key `jobrocket-color-scheme`
- **Default**: Auto (follows system preference)
- **CSS Variables**: Custom resolver for body background colors
  - Light: `#ffffff`
  - Dark: `#222222`

**Light-dark CSS Function**:
```typescript
'--button-bg': `light-dark(${lightColor}, ${darkColor})`
```

### Typography
- **Primary Font**: Poppins (modern, clean)
- **Fallbacks**: Inter, Roboto, sans-serif
- **Weight**: 400 (normal) for consistency
- **Headings**: Same font family

### Component Defaults
Set defaults for consistency:
```typescript
Card: { defaultProps: { radius: 'md', shadow: 'sm' } }
Paper: { defaultProps: { radius: 'md', shadow: 'sm' } }
Modal: { defaultProps: { radius: 'md' } }
```

### Responsive Design
- **Breakpoints**: Mantine default breakpoints
- **Mobile-first**: Base styles for mobile, override for desktop
- **Media Queries**: `useMediaQuery()` hook from Mantine
- **Responsive Props**: Mantine components accept object notation for responsive values

### Notifications
**Library**: `@mantine/notifications`

**Position**:
- Mobile: `top-center`
- Desktop: `bottom-right`

**Usage**:
```typescript
import { notifications } from '@mantine/notifications';

notifications.show({
  title: 'Success',
  message: 'Operation completed',
  color: 'green'
});
```

### Icons
**Library**: `@tabler/icons-react`

Consistent icon set across application:
```typescript
import { IconName } from '@tabler/icons-react';
<IconName size={20} stroke={1.5} />
```

### Empty States
**Component**: `components/EmptyState/`

Consistent messaging for no data scenarios:
- Illustrative icon
- Descriptive message
- Optional call-to-action

### Loading States
- **Global**: `<Loader />` component
- **Suspense fallback**: Page loader with centered spinner
- **Inline**: Skeleton components for content

### Error States
- **Error Boundary**: Catches React errors
- **Error Fallback**: Full-page error display
- **Inline Errors**: Form validation messages

### Form Design
- **Mantine Form Components**: TextInput, Select, Textarea, etc.
- **Validation**: Inline error messages
- **Labels**: Clear, concise labels
- **Required Indicators**: Visual indicator for required fields
- **Help Text**: Additional context below inputs

### Modal Patterns
**Component**: `components/Modals/`

Consistent modal design:
- Centered by default
- Accessible (focus trap, ESC to close)
- Mobile-responsive (full-screen on small screens)
- Clear title and actions

---

## Key Patterns & Conventions

### Code Organization

#### Frontend
1. **Component Files**: `.tsx` extension
2. **Utility Files**: `.ts` extension
3. **Styles**: CSS modules or Mantine's styling
4. **Naming**: PascalCase for components, camelCase for functions/variables
5. **Exports**: Named exports preferred, default for page components

#### Backend
1. **Module System**: CommonJS (`require`, `module.exports`)
2. **File Extension**: `.js`
3. **Naming**: camelCase for files and functions, PascalCase for models
4. **Exports**: `module.exports = { ... }` for multiple exports

### Naming Conventions

#### Files
- **Pages**: `PageName.pages.tsx`
- **Components**: `ComponentName.tsx`
- **Hooks**: `useHookName.ts`
- **Services**: `entityService.js`
- **Controllers**: `entityController.js`
- **Routes**: `entityRoutes.js`
- **Models**: `EntityName.js`
- **Middleware**: `functionalityMiddleware.js`

#### Variables/Functions
- **Boolean**: `isActive`, `hasPermission`, `shouldRender`
- **Handlers**: `handleClick`, `handleSubmit`, `handleChange`
- **Getters**: `getUser`, `fetchData`, `loadItems`
- **Setters**: `setUser`, `updateData`, `saveItem`
- **Async Functions**: Use `async/await`, prefix with verb

### Error Handling Patterns

#### Frontend
```typescript
try {
  const response = await axios.get('/api/endpoint');
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else {
    // Handle general error
    notifications.show({
      title: 'Error',
      message: error.response?.data?.message || 'An error occurred',
      color: 'red'
    });
  }
}
```

#### Backend
```javascript
// In services: throw errors
if (!resource) {
  throwError(404, 'Resource not found');
}

// In controllers: catch and pass to next
try {
  const result = await service.operation();
  res.status(200).json(result);
} catch (error) {
  next(error);
}

// In middleware: pass to next
if (!authorized) {
  return nextError(next, 403, 'Access denied');
}
```

### Async Patterns

#### Frontend
- Use `async/await` in hooks and handlers
- Handle loading states
- Handle error states
- Clean up with `useEffect` return function

#### Backend
- Use `async/await` consistently
- No callback patterns
- Handle all promises
- Use try/catch in controllers

### Data Flow

#### Frontend → Backend
1. User interaction → Event handler
2. Handler calls API via axios
3. Axios sends request with session cookie
4. Backend validates → processes → responds
5. Frontend updates state/UI

#### Backend → Frontend
1. Request → Middleware chain
2. Controller → Service → Database
3. Normalize response
4. Send JSON response
5. Frontend receives → updates state

### Environment Variables

#### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Backend (`.env`)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dbname
MONGODB_ATLAS_URI=mongodb+srv://...
SESSION_SECRET=random-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
OPENAI_API_KEY=...
```

### API Response Patterns

#### Success Response
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "message": "Error description",
  "error": "Error type"
}
```

#### List Response
```json
{
  "data": [ ... ],
  "count": 42,
  "page": 1,
  "totalPages": 5
}
```

### Testing Patterns

#### Frontend (Vitest + Testing Library)
```typescript
import { render, screen, waitFor } from '@test-utils';
import userEvent from '@testing-library/user-event';

test('component behavior', async () => {
  render(<Component />);

  const button = screen.getByRole('button');
  await userEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

#### Backend (Jest + Supertest)
```javascript
const request = require('supertest');
const app = require('../app');

describe('API endpoint', () => {
  it('should return data', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

---

## Configuration & Environment

### Development Setup

#### Prerequisites
- Node.js 18+ (or specified version)
- MongoDB (local or Atlas)
- npm or yarn

#### Installation
```bash
# Backend
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

#### Development Scripts
**Frontend**:
- `npm run dev` - Start dev server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm test` - Run tests

**Backend**:
- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run prettier:write` - Format code

### Production Build

#### Backend
```bash
npm run build
```
This script:
1. Installs backend dependencies
2. Installs frontend dependencies
3. Builds frontend
4. Copies build to `backend/public/`

#### Deployment
- Backend serves static frontend from `public/`
- Environment: `NODE_ENV=production`
- Database: MongoDB Atlas
- Session: Secure cookies, trust proxy

#### Environment Variables (Production)
- Set all secrets in hosting platform
- Use strong `SESSION_SECRET`
- Configure OAuth redirect URLs
- Set `NODE_ENV=production`

### Database Configuration

#### Development
- Local MongoDB: `mongodb://localhost:27017/dbname`
- Seeding enabled automatically
- Reset database with seeding

#### Production
- MongoDB Atlas cluster
- Connection string with credentials
- No seeding
- Backups configured

#### Testing
- Separate test database
- Clean database before each test suite
- Mock external services

---

## Testing Strategy

### Frontend Testing

#### Unit Tests
- **Target**: Utility functions, hooks, isolated components
- **Framework**: Vitest
- **Location**: Co-located with code or `__tests__` folder

#### Component Tests
- **Target**: Component behavior and user interactions
- **Framework**: Vitest + Testing Library
- **Patterns**:
  - Render component
  - Simulate user interactions
  - Assert on DOM changes

#### Integration Tests
- **Target**: Page-level flows
- **Mock**: API calls with MSW or axios mocks

### Backend Testing

#### Unit Tests
- **Target**: Services, utilities, middleware
- **Framework**: Jest
- **Patterns**:
  - Test business logic in isolation
  - Mock database calls
  - Test error conditions

#### Integration Tests
- **Target**: API endpoints
- **Framework**: Jest + Supertest
- **Patterns**:
  - Test full request/response cycle
  - Use test database
  - Test authentication/authorization

#### Database Tests
- **Setup**: Clean database before each test
- **Teardown**: Close connections after tests
- **Patterns**:
  - Test CRUD operations
  - Test validations
  - Test hooks

### Test Structure
```javascript
describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', async () => {
    // Arrange
    const input = setupTestData();

    // Act
    const result = await functionUnderTest(input);

    // Assert
    expect(result).toEqual(expected);
  });
});
```

---

## Additional Patterns

### Analytics Integration
**File**: `frontend/src/utils/analytics.ts`

- Google Analytics 4 integration
- Cookie consent management
- Custom event tracking
- Error tracking
- Page view tracking

### Cookie Consent
**Component**: `components/CookieBanner/`

- GDPR/privacy compliance
- LocalStorage for consent
- Analytics initialization gated by consent
- Custom event for consent changes

### SEO
**Folder**: `frontend/src/SEO/`

- Meta tags for social sharing
- Dynamic page titles
- Structured data (JSON-LD)
- Sitemap generation

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management (modals, drawers)
- Color contrast (WCAG AA)
- Screen reader testing

### Performance Optimization

#### Frontend
- Code splitting (lazy loading)
- Image optimization
- Bundle size monitoring
- Memoization (React.memo, useMemo, useCallback)
- Debouncing/throttling for user input

#### Backend
- Database indexing
- Query optimization
- Response caching
- Connection pooling
- Rate limiting

---

## Migration Checklist for New Project

When adapting this architecture for a new domain (e.g., Jewish calendar app):

### 1. Core Structure
- [ ] Clone project structure (keep folder organization)
- [ ] Update `package.json` name and description
- [ ] Update theme colors to match new brand
- [ ] Update font choices (keep structure)

### 2. Data Models
- [ ] Design new database schemas
- [ ] Keep authentication patterns
- [ ] Adapt authorization levels to new roles
- [ ] Update validation schemas

### 3. Frontend Components
- [ ] Reuse layout and navigation structure
- [ ] Reuse authentication flows
- [ ] Create domain-specific components
- [ ] Reuse modal, form, and error patterns

### 4. Backend Structure
- [ ] Keep middleware architecture
- [ ] Keep service/controller separation
- [ ] Update routes for new domain
- [ ] Keep error handling patterns

### 5. Configuration
- [ ] Update environment variables
- [ ] Configure OAuth providers
- [ ] Set up external services (file upload, email, etc.)
- [ ] Update CORS and CSP policies

### 6. Testing
- [ ] Adapt test structure
- [ ] Update test data
- [ ] Keep testing patterns

### 7. Deployment
- [ ] Configure hosting
- [ ] Set up database
- [ ] Configure environment
- [ ] Set up monitoring/logging

---

## Conclusion

This architecture provides a robust, scalable foundation for full-stack web applications. Key strengths:

- **Separation of Concerns**: Clear boundaries between layers
- **Type Safety**: TypeScript frontend, Joi validation throughout
- **Security First**: Multiple layers of security, GDPR compliance
- **Developer Experience**: Clear patterns, good tooling, comprehensive error handling
- **User Experience**: Responsive design, dark mode, accessibility, performance
- **Maintainability**: Consistent naming, clear structure, good documentation

Adapt this template by keeping the structure and patterns while replacing domain-specific content (models, components, business logic) with your new application's requirements.

---

**Version**: 1.0
**Last Updated**: 2026-01-14
**Source Project**: jobRocket
