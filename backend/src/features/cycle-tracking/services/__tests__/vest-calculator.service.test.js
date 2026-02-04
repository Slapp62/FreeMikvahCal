const { Location, Zmanim } = require('@hebcal/core');
const { calculateVesetHachodesh } = require('../vest-calculator.service');

const location = {
  lat: 40.7128,
  lng: -74.0060,
  timezone: 'America/New_York'
};

function buildDayOnahPeriod(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);
  const loc = new Location(location.lat, location.lng, false, location.timezone);
  const zmanim = new Zmanim(loc, date, false);

  return {
    niddahOnah: {
      start: zmanim.sunrise(),
      end: zmanim.sunset()
    }
  };
}

describe('calculateVesetHachodesh', () => {
  it('moves to next Hebrew month and does not stay on period day (Adar boundary regression)', () => {
    const period = buildDayOnahPeriod('2026-03-05');

    const veset = calculateVesetHachodesh(period, location, true, false)[0];

    expect(new Date(veset.start).getTime()).not.toBe(new Date(period.niddahOnah.start).getTime());
  });

  it('keeps day-of-month in a regular month transition', () => {
    const period = buildDayOnahPeriod('2026-01-05');

    const veset = calculateVesetHachodesh(period, location, true, false)[0];

    const loc = new Location(location.lat, location.lng, false, location.timezone);
    const startHDate = Zmanim.makeSunsetAwareHDate(loc, period.niddahOnah.start, false);
    const vesetHDate = Zmanim.makeSunsetAwareHDate(loc, veset.start, false);

    expect(vesetHDate.getDate()).toBe(startHDate.getDate());
    expect(vesetHDate.getMonth()).not.toBe(startHDate.getMonth());
  });

  it('with 30th-skip chumra, skips 29-day month and lands on next 30th', () => {
    const period = {
      niddahOnah: {
        // 30 Shevat 5786 (period start)
        start: new Date('2026-02-17T12:00:00.000Z'),
        end: new Date('2026-02-17T18:00:00.000Z')
      }
    };

    const defaultVeset = calculateVesetHachodesh(period, location, true, false, false)[0];
    const skipVeset = calculateVesetHachodesh(period, location, true, false, true)[0];

    const loc = new Location(location.lat, location.lng, false, location.timezone);
    const defaultHDate = Zmanim.makeSunsetAwareHDate(loc, defaultVeset.start, false);
    const skipHDate = Zmanim.makeSunsetAwareHDate(loc, skipVeset.start, false);

    expect(defaultHDate.getDate()).toBe(29);
    expect(skipHDate.getDate()).toBe(30);
    expect(skipHDate.getMonth()).not.toBe(defaultHDate.getMonth());
  });
});
