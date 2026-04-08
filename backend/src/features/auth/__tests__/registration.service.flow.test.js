const makeDoc = (data) => ({
  ...data,
  toObject() {
    return { ...data };
  }
});

const mockAuthFindOne = jest.fn();
const mockAuthSave = jest.fn();
const mockProfileSave = jest.fn();

const mockAuthModel = jest.fn().mockImplementation((data) => ({
  ...makeDoc({
    _id: 'auth-1',
    ...data
  }),
  save: mockAuthSave
}));
mockAuthModel.findOne = mockAuthFindOne;

const mockProfileModel = jest.fn().mockImplementation((data) => ({
  ...makeDoc({
    _id: 'profile-1',
    ...data
  }),
  save: mockProfileSave
}));

jest.mock('../models/auth.model', () => mockAuthModel);
jest.mock('../../user-profile/models/profile.model', () => mockProfileModel);
jest.mock('../../../shared/utils/log-helpers', () => ({
  logAuth: jest.fn()
}));

const { register } = require('../registration.service');

describe('registration service flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthFindOne.mockResolvedValue(null);
    mockAuthSave.mockResolvedValue(undefined);
    mockProfileSave.mockResolvedValue(undefined);
  });

  it('creates profile and auth records with defaults and verification code', async () => {
    const result = await register(
      {
        email: 'User@Example.com',
        password: 'StrongPass1!',
        location: {
          city: 'Jerusalem',
          timezone: 'Asia/Jerusalem'
        },
        consents: {
          dataProcessing: {
            granted: true
          }
        },
        halachicCustom: 'ashkenazi_EY',
        halachicPreferences: {
          beinonit_31: true,
          minimumNiddahDays: 5
        }
      },
      {
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test'
      }
    );

    expect(mockAuthFindOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    expect(mockProfileModel).toHaveBeenCalledWith(
      expect.objectContaining({
        location: expect.objectContaining({
          city: 'Jerusalem',
          timezone: 'Asia/Jerusalem'
        }),
        halachicCustom: 'ashkenazi_EY',
        halachicPreferences: expect.objectContaining({
          beinonit_31: true,
          minimumNiddahDays: 5
        }),
        profileComplete: false,
        onboardingCompleted: false
      })
    );
    expect(mockAuthModel).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'profile-1',
        email: 'user@example.com',
        password: 'StrongPass1!',
        emailVerified: false
      })
    );
    expect(result.user.email).toBe('user@example.com');
    expect(result.user.password).toBeUndefined();
    expect(result.code).toMatch(/^\d{6}$/);
  });

  it('rejects duplicate email registration', async () => {
    mockAuthFindOne.mockResolvedValue({ _id: 'existing-auth' });

    await expect(
      register({
        email: 'user@example.com',
        password: 'StrongPass1!',
        consents: {
          dataProcessing: {
            granted: true
          }
        }
      })
    ).rejects.toMatchObject({
      status: 400,
      message: 'Email already registered'
    });

    expect(mockProfileModel).not.toHaveBeenCalled();
    expect(mockAuthModel).not.toHaveBeenCalled();
  });
});
