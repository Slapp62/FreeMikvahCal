const crypto = require('crypto');

const mockAuthFindOne = jest.fn();
const mockProfileFindById = jest.fn();
const mockSendPasswordResetEmail = jest.fn();

jest.mock('../models/auth.model', () => ({
  findOne: (...args) => mockAuthFindOne(...args)
}));

jest.mock('../../user-profile/models/profile.model', () => ({
  findById: (...args) => mockProfileFindById(...args)
}));

jest.mock('../../../shared/services/email.service', () => ({
  sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args)
}));

jest.mock('../../../shared/utils/log-helpers', () => ({
  logAuth: jest.fn()
}));

const authenticationService = require('../authentication.service');

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

describe('authentication service flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs password reset request -> verify code -> reset password flow', async () => {
    const authRecord = {
      userId: 'user-1',
      email: 'user@example.com',
      isActive: true,
      password: 'OldPassword1!',
      passwordReset: undefined,
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return { ...this };
      }
    };

    mockAuthFindOne.mockImplementation((query) => {
      if (query.email && query.isActive && !query['passwordReset.verifiedTokenHash']) {
        return Promise.resolve(authRecord);
      }

      if (query['passwordReset.verifiedTokenHash']) {
        const matchesHash = query['passwordReset.verifiedTokenHash'] === authRecord.passwordReset?.verifiedTokenHash;
        return {
          select: jest.fn().mockResolvedValue(matchesHash ? authRecord : null)
        };
      }

      return Promise.resolve(null);
    });

    const requestResult = await authenticationService.requestPasswordReset('user@example.com');
    expect(requestResult.message).toMatch(/If an account exists/);
    expect(authRecord.passwordReset.codeHash).toBeTruthy();
    expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(1);

    const sentCode = mockSendPasswordResetEmail.mock.calls[0][2];
    expect(sentCode).toMatch(/^\d{6}$/);

    const verifyResult = await authenticationService.verifyResetCode('user@example.com', sentCode);
    expect(verifyResult.message).toBe('Code verified');
    expect(verifyResult.resetToken).toHaveLength(64);
    expect(authRecord.passwordReset.verifiedTokenHash).toBe(hashValue(verifyResult.resetToken));

    const resetResult = await authenticationService.resetPasswordWithToken(
      verifyResult.resetToken,
      'NewPassword1!'
    );

    expect(resetResult.message).toBe('Password reset successfully');
    expect(authRecord.password).toBe('NewPassword1!');
    expect(authRecord.passwordReset).toBeUndefined();
    expect(authRecord.save).toHaveBeenCalledTimes(3);
  });

  it('increments attempts and rejects invalid reset codes', async () => {
    const authRecord = {
      userId: 'user-1',
      email: 'user@example.com',
      isActive: true,
      passwordReset: {
        codeHash: hashValue('123456'),
        codeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        attempts: 0
      },
      save: jest.fn().mockResolvedValue(undefined)
    };

    mockAuthFindOne.mockResolvedValue(authRecord);

    await expect(
      authenticationService.verifyResetCode('user@example.com', '654321')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Invalid or expired code'
    });

    expect(authRecord.passwordReset.attempts).toBe(1);
    expect(authRecord.save).toHaveBeenCalledTimes(1);
  });
});
