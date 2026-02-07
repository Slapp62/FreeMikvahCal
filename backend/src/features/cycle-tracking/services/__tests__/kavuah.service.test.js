const { DateTime } = require('luxon');
const {
  calculateInclusiveIntervalDays,
  checkKavuahChodesh,
  checkKavuahHaflagah,
  determineKavuahStatus
} = require('../kavuah.service');

const makePeriod = ({ date, timezone = 'America/New_York', onahType = 'day', hebrewDay = 15 }) => {
  return {
    niddahOnah: {
      start: DateTime.fromISO(`${date}T10:00`, { zone: timezone }).toJSDate(),
      end: DateTime.fromISO(`${date}T18:00`, { zone: timezone }).toJSDate()
    },
    calculatedInTimezone: timezone,
    onahType,
    hebrewDate: { day: hebrewDay }
  };
};

describe('kavuah.service', () => {
  describe('calculateInclusiveIntervalDays', () => {
    it('returns inclusive interval in days based on local dates', () => {
      const prev = makePeriod({ date: '2026-01-01' });
      const current = makePeriod({ date: '2026-01-05' });
      const interval = calculateInclusiveIntervalDays(current, prev);
      expect(interval).toBe(5);
    });
  });

  describe('checkKavuahChodesh', () => {
    it('returns true when last three periods share same Hebrew day and onah type', () => {
      const current = makePeriod({ date: '2026-03-10', hebrewDay: 12, onahType: 'night' });
      const prev1 = makePeriod({ date: '2026-02-10', hebrewDay: 12, onahType: 'night' });
      const prev2 = makePeriod({ date: '2026-01-10', hebrewDay: 12, onahType: 'night' });
      expect(checkKavuahChodesh([current, prev1, prev2])).toBe(true);
    });

    it('returns false when onah types differ', () => {
      const current = makePeriod({ date: '2026-03-10', hebrewDay: 12, onahType: 'day' });
      const prev1 = makePeriod({ date: '2026-02-10', hebrewDay: 12, onahType: 'night' });
      const prev2 = makePeriod({ date: '2026-01-10', hebrewDay: 12, onahType: 'day' });
      expect(checkKavuahChodesh([current, prev1, prev2])).toBe(false);
    });
  });

  describe('checkKavuahHaflagah', () => {
    it('returns true when last three intervals match and last three onah types match', () => {
      const p1 = makePeriod({ date: '2026-01-01', onahType: 'night' });
      const p2 = makePeriod({ date: '2026-01-05', onahType: 'day' });
      const p3 = makePeriod({ date: '2026-01-09', onahType: 'day' });
      const p4 = makePeriod({ date: '2026-01-13', onahType: 'day' });
      const result = checkKavuahHaflagah([p4, p3, p2, p1]);
      expect(result.isKavuah).toBe(true);
      expect(result.interval).toBe(5);
    });

    it('returns false when last three onah types do not match', () => {
      const p1 = makePeriod({ date: '2026-01-01', onahType: 'day' });
      const p2 = makePeriod({ date: '2026-01-05', onahType: 'night' });
      const p3 = makePeriod({ date: '2026-01-09', onahType: 'day' });
      const p4 = makePeriod({ date: '2026-01-13', onahType: 'day' });
      const result = checkKavuahHaflagah([p4, p3, p2, p1]);
      expect(result.isKavuah).toBe(false);
    });
  });

  describe('determineKavuahStatus', () => {
    it('prioritizes chodesh over haflagah when both apply', () => {
      const p1 = makePeriod({ date: '2026-01-01', onahType: 'day', hebrewDay: 7 });
      const p2 = makePeriod({ date: '2026-01-05', onahType: 'day', hebrewDay: 7 });
      const p3 = makePeriod({ date: '2026-01-09', onahType: 'day', hebrewDay: 7 });
      const p4 = makePeriod({ date: '2026-01-13', onahType: 'day', hebrewDay: 7 });
      const result = determineKavuahStatus([p4, p3, p2, p1]);
      expect(result.type).toBe('chodesh');
    });
  });
});
