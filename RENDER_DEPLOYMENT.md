# Render Deployment Guide

This application serves a React frontend from an Express backend. Follow these instructions to deploy on Render.

## Prerequisites

- Render account
- MongoDB Atlas database (or another MongoDB provider)
- Environment variables ready

## Deployment Steps

### 1. Create a Web Service on Render

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository

### 2. Configure Build Settings

**Root Directory:** Leave blank (uses root of repo)

**Build Command:**
```bash
cd frontend && npm install && npm run build && cp -r dist/* ../backend/public/ && cd ../backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

### 3. Environment Variables

Set these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGO_URI=<your-mongodb-atlas-uri>
SESSION_SECRET=<generate-a-secure-random-string>
FRONTEND_URL=<your-render-app-url>
GOOGLE_CLIENT_ID=<optional-google-oauth-id>
GOOGLE_CLIENT_SECRET=<optional-google-oauth-secret>
GOOGLE_CALLBACK_URL=<your-render-app-url>/api/auth/google/callback
```

### 4. Important Notes

- The PORT variable is automatically set by Render to 10000
- Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Render's IPs to the whitelist
- The backend serves the React app from the `/backend/public` directory
- All API routes are prefixed with `/api`
- The catch-all route `/*` serves the React app for client-side routing

### 5. Health Check

Render will automatically check the `/health` endpoint to ensure the service is running.

### 6. Testing Locally

To test the production build locally:

```bash
# Build frontend
cd frontend
npm install
npm run build
cp -r dist/* ../backend/public/

# Run backend
cd ../backend
npm install
NODE_ENV=production npm start
```

Then visit `http://localhost:5000` in your browser.

## Troubleshooting

### Build fails
- Check that all dependencies are listed in package.json
- Ensure TypeScript compiles without errors: `cd frontend && npm run typecheck`
- Check ESLint: `cd backend && npx eslint .`

### App serves but shows 404
- Verify that the frontend build copied to backend/public
- Check that app.js has the correct static file serving and catch-all route

### API calls fail
- Verify CORS settings in backend/app.js
- Check that FRONTEND_URL environment variable is set correctly
- Ensure MongoDB connection string is correct

### Session issues
- Verify SESSION_SECRET is set
- Check that MongoDB session store is connecting properly
