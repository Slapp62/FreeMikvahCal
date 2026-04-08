const mockPeriodFindOne = jest.fn();
const mockPeriodFind = jest.fn();
const mockProfileFindById = jest.fn();
const mockVestosFindOneAndUpdate = jest.fn();
const mockVestosFindOne = jest.fn();
const mockBedikahsFind = jest.fn();
const mockBedikahSave = jest.fn();

const makeQueryChain = (resolvedValue) => ({
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue(resolvedValue)
});

jest.mock('../../../models/period.model', () => {
  const BedikahPeriod = function () {};
  BedikahPeriod.findOne = (...args) => mockPeriodFindOne(...args);
  BedikahPeriod.find = (...args) => mockPeriodFind(...args);
  return BedikahPeriod;
});

jest.mock('../../../models/bedikah.model', () => {
  return function MockBedikah(data) {
    return {
      _id: 'bedikah-1',
      ...data,
      save: mockBedikahSave,
      toObject() {
        return { _id: this._id, ...data };
      }
    };
  };
});

jest.mock('../../../models/vestos.model', () => ({
  findOneAndUpdate: (...args) => mockVestosFindOneAndUpdate(...args),
  findOne: (...args) => mockVestosFindOne(...args)
}));

jest.mock('../../../../user-profile/models/profile.model', () => ({
  findById: (...args) => mockProfileFindById(...args)
}));

jest.mock('../../../../../shared/utils/hebrew-datetime', () => ({
  createDateInTimezone: jest.fn((dateString, timeString) => new Date(`${dateString}T${timeString}:00.000Z`))
}));

jest.mock('@hebcal/core', () => ({
  Location: jest.fn(),
  Zmanim: jest.fn().mockImplementation(() => ({
    sunset: () => new Date('2026-04-10T17:45:00.000Z')
  }))
}));

jest.mock('../../cycle-metrics.service', () => ({
  calculateCycleMetrics: jest.fn(() => ({
    cycleLength: 12,
    haflagah: 28
  }))
}));

jest.mock('../../vest-calculator.service', () => ({
  calculateAllVestOnot: jest.fn(() => ({
    vestOnot: {
      onahBeinonit: {
        start: new Date('2026-04-25T06:00:00.000Z'),
        end: new Date('2026-04-25T18:00:00.000Z')
      }
    },
    appliedChumras: {
      beinonit_31: true
    }
  }))
}));

jest.mock('../../../../../shared/utils/log-helpers', () => ({
  logDatabase: jest.fn(),
  logBusiness: jest.fn()
}));

const { updateCycle, addBedika } = require('../cycle-update.service');

describe('cycle lifecycle service flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('moves a cycle into shiva nekiyim and recalculates vestos when mikvah is updated', async () => {
    const period = {
      _id: 'cycle-1',
      userId: 'user-1',
      niddahOnah: {
        start: new Date('2026-04-01T06:00:00.000Z'),
        end: new Date('2026-04-01T18:00:00.000Z')
      },
      status: 'niddah',
      notes: '',
      privateNotes: '',
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return {
          _id: this._id,
          userId: this.userId,
          niddahOnah: this.niddahOnah,
          status: this.status,
          hefsekTaharaDate: this.hefsekTaharaDate,
          shivaNekiyimStartDate: this.shivaNekiyimStartDate,
          mikvahDate: this.mikvahDate,
          notes: this.notes,
          privateNotes: this.privateNotes,
          cycleLength: this.cycleLength
        };
      }
    };

    const profile = {
      location: {
        lat: 31.778,
        lng: 35.235,
        timezone: 'Asia/Jerusalem'
      },
      halachicPreferences: {
        minimumNiddahDays: 5,
        beinonit_31: true
      }
    };

    mockPeriodFindOne.mockResolvedValue(period);
    mockProfileFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue(profile)
    });
    mockPeriodFind.mockReturnValue(makeQueryChain([]));
    mockVestosFindOneAndUpdate.mockResolvedValue(undefined);
    mockVestosFindOne.mockResolvedValue({
      vestOnot: { onahBeinonit: { start: '2026-04-25T06:00:00.000Z' } }
    });
    mockBedikahsFind.mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });
    require('../../../models/bedikah.model').find = (...args) => mockBedikahsFind(...args);

    const result = await updateCycle('user-1', 'cycle-1', {
      hefsekTaharaDate: {
        dateString: '2026-04-10'
      },
      mikvahDate: {
        dateString: '2026-04-17',
        timeString: '20:30'
      }
    });

    expect(period.status).toBe('shiva_nekiyim');
    expect(period.hefsekTaharaDate).toEqual(new Date('2026-04-10T20:45:00.000Z'));
    expect(period.shivaNekiyimStartDate).toEqual(new Date('2026-04-11T20:45:00.000Z'));
    expect(period.mikvahDate).toEqual(new Date('2026-04-17T20:30:00.000Z'));
    expect(mockVestosFindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(result.vestOnot).toBeTruthy();
  });

  it('voids an in-progress cycle when a bedikah is not clean', async () => {
    const period = {
      _id: 'cycle-1',
      userId: 'user-1',
      niddahOnah: {
        start: new Date('2026-04-01T06:00:00.000Z'),
        end: new Date('2026-04-01T18:00:00.000Z')
      },
      hefsekTaharaDate: new Date('2026-04-10T17:45:00.000Z'),
      shivaNekiyimStartDate: new Date('2026-04-11T17:45:00.000Z'),
      mikvahDate: new Date('2026-04-17T20:30:00.000Z'),
      status: 'shiva_nekiyim',
      save: jest.fn().mockResolvedValue(undefined)
    };

    mockPeriodFindOne.mockResolvedValue(period);
    mockProfileFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        location: {
          timezone: 'Asia/Jerusalem'
        }
      })
    });
    mockBedikahSave.mockResolvedValue(undefined);

    const result = await addBedika('user-1', 'cycle-1', {
      date: {
        dateString: '2026-04-12',
        timeString: '09:00'
      },
      dayNumber: 2,
      timeOfDay: 'morning',
      results: {
        morning: 'not_clean'
      },
      notes: 'Flow test'
    });

    expect(period.status).toBe('niddah');
    expect(period.hefsekTaharaDate).toBeNull();
    expect(period.shivaNekiyimStartDate).toBeNull();
    expect(period.mikvahDate).toBeNull();
    expect(period.periodVoidedInfo.isVoided).toBe(true);
    expect(result.results.morning).toBe('not_clean');
  });
});
