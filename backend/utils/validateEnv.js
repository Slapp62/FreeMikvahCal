/**
 * Validate required environment variables
 * Throws an error if any required variable is missing
 */
const validateEnv = () => {
  const required = ['SESSION_SECRET'];

  // Check for environment-specific MongoDB URI
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoVar = isProduction ? 'MONGO_ATLAS_URI' : 'MONGO_LOCAL_URI';

  if (!process.env[mongoVar]) {
    required.push(mongoVar);
  }

  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file.'
    );
  }

  // Warn about insecure defaults in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.SESSION_SECRET === 'change-this-secret-in-production') {
      throw new Error(
        'SESSION_SECRET must be changed in production. ' +
          'Using the default value is a critical security risk.'
      );
    }

    if (!process.env.FRONTEND_URL) {
      console.warn('WARNING: FRONTEND_URL not set in production. CORS may not work correctly.');
    }
  }

  console.log('✓ Environment variables validated');
};

module.exports = { validateEnv };
