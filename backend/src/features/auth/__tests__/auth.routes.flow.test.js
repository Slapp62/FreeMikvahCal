const request = require('supertest');

jest.mock('../registration.controller', () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: 'Registration successful', email: req.body.email })),
  verifyCode: jest.fn((req, res) => res.status(200).json({ status: 'success' })),
  resendVerification: jest.fn((req, res) => res.status(200).json({ message: 'Verification code resent.' })),
  completeProfile: jest.fn((req, res) => res.status(200).json({ message: 'Profile completed successfully' }))
}));

jest.mock('../authentication.controller', () => ({
  login: jest.fn((req, res) => res.status(200).json({ message: 'Login successful' })),
  logout: jest.fn((req, res) => res.status(200).json({ message: 'Logout successful' })),
  getSession: jest.fn((req, res) => res.status(200).json({ authenticated: true })),
  changePassword: jest.fn((req, res) => res.status(200).json({ message: 'Password changed successfully' })),
  forgotPassword: jest.fn((req, res) => res.status(200).json({ message: 'Reset email sent' })),
  verifyResetCode: jest.fn((req, res) => res.status(200).json({ message: 'Code verified' })),
  resetPassword: jest.fn((req, res) => res.status(200).json({ message: 'Password reset successfully' }))
}));

jest.mock('../oauth.controller', () => ({
  initiateGoogleAuth: jest.fn((req, res) => res.status(302).end()),
  handleGoogleCallback: jest.fn((req, res) => res.status(302).end()),
  linkGoogleAccount: jest.fn((req, res) => res.status(200).json({ message: 'Google linked' }))
}));

jest.mock('../../../shared/middleware/rate-limiter', () => ({
  authLimiter: (req, res, next) => next()
}));

const registrationController = require('../registration.controller');
const authenticationController = require('../authentication.controller');
const authRoutes = require('../auth.routes');
const { createRouteTestApp } = require('../../../../test/helpers/create-route-test-app');

describe('auth routes flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid registration payloads before controller execution', async () => {
    const app = createRouteTestApp(authRoutes);

    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'bad-email',
        password: 'weak',
        consents: { dataProcessing: { granted: true } }
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
    expect(registrationController.register).not.toHaveBeenCalled();
  });

  it('accepts a valid registration request through the route stack', async () => {
    const app = createRouteTestApp(authRoutes);

    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'user@example.com',
        password: 'StrongPass1!',
        consents: {
          dataProcessing: {
            granted: true
          }
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('user@example.com');
    expect(registrationController.register).toHaveBeenCalledTimes(1);
  });

  it('requires authentication for complete-profile', async () => {
    const app = createRouteTestApp(authRoutes, { authenticated: false });

    const response = await request(app)
      .patch('/api/complete-profile')
      .send({
        location: {
          city: 'Jerusalem',
          timezone: 'Asia/Jerusalem'
        }
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication required');
  });

  it('validates login payloads before controller execution', async () => {
    const app = createRouteTestApp(authRoutes);

    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'invalid',
        password: ''
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
    expect(authenticationController.login).not.toHaveBeenCalled();
  });
});
