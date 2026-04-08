jest.mock('../../../../user-profile/models/profile.model', () => ({
  findById: jest.fn(() => ({
    select: jest.fn().mockResolvedValue({
      location: {
        lat: 31.778,
        lng: 35.235,
        timezone: 'Asia/Jerusalem'
      }
    })
  }))
}));

const { buildCalendarEvents } = require('../calendar-events.service');

describe('buildCalendarEvents', () => {
  it('includes optional beinonit and ohr zaruah events in calendar payload', async () => {
    const cycle = {
      _id: 'cycle-1',
      niddahOnah: {
        start: new Date('2026-01-01T06:00:00.000Z'),
        end: new Date('2026-01-01T16:00:00.000Z')
      },
      vestOnot: {
        haflagah: [
          {
            start: new Date('2026-01-29T06:00:00.000Z'),
            end: new Date('2026-01-29T16:00:00.000Z'),
            ohrZaruah: {
              start: new Date('2026-01-28T16:00:00.000Z'),
              end: new Date('2026-01-29T06:00:00.000Z')
            }
          }
        ],
        onahBeinonit: {
          start: new Date('2026-01-30T06:00:00.000Z'),
          end: new Date('2026-01-30T16:00:00.000Z'),
          beinonit_24hr: {
            start: new Date('2026-01-29T16:00:00.000Z'),
            end: new Date('2026-01-30T06:00:00.000Z')
          },
          beinonit_31: {
            start: new Date('2026-01-31T06:00:00.000Z'),
            end: new Date('2026-01-31T16:00:00.000Z')
          },
          ohrZaruah: {
            start: new Date('2026-01-29T16:00:00.000Z'),
            end: new Date('2026-01-30T06:00:00.000Z')
          }
        }
      }
    };

    const events = await buildCalendarEvents('user-1', [cycle]);

    expect(events.some((event) => event.title === '⏱️ Haflagah')).toBe(true);
    expect(events.some((event) => event.title === "🔄 Kreisi U'Pleisi")).toBe(true);
    expect(events.some((event) => event.title === '🔄 Beinonit 31')).toBe(true);
    expect(events.some((event) => event.title === '📏 Ohr Zaruah - Haflagah')).toBe(true);
    expect(events.some((event) => event.title === '📏 Ohr Zaruah - Onah Beinonit')).toBe(true);
  });
});
