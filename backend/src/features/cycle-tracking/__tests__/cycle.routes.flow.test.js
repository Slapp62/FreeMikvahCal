const request = require('supertest');

jest.mock('../cycle.controller', () => ({
  getUserCycles: jest.fn((req, res) => res.status(200).json({ count: 0, cycles: [] })),
  createCycle: jest.fn((req, res) => res.status(201).json({
    message: 'Cycle created successfully',
    cycle: { id: 'cycle-1', ...req.body }
  })),
  getCycle: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
  updateCycle: jest.fn((req, res) => res.status(200).json({ message: 'Cycle updated successfully' })),
  deleteCycle: jest.fn((req, res) => res.status(200).json({ message: 'Cycle deleted successfully' })),
  addBedika: jest.fn((req, res) => res.status(201).json({ message: 'Bedika added successfully' })),
  getActiveCycle: jest.fn((req, res) => res.status(200).json({ cycle: null })),
  getUpcomingVestOnot: jest.fn((req, res) => res.status(200).json({ count: 0, vestOnot: [] })),
  getCalendarEvents: jest.fn((req, res) => res.status(200).json({ count: 1, events: [{ id: 'calendar-event' }] }))
}));

jest.mock('../../../shared/middleware/rate-limiter', () => ({
  apiLimiter: (req, res, next) => next()
}));

const cycleController = require('../cycle.controller');
const cycleRoutes = require('../cycle.routes');
const { createRouteTestApp } = require('../../../../test/helpers/create-route-test-app');

describe('cycle routes flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires authentication before accessing cycle endpoints', async () => {
    const app = createRouteTestApp(cycleRoutes, { authenticated: false });

    const response = await request(app)
      .get('/api/');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication required');
    expect(cycleController.getUserCycles).not.toHaveBeenCalled();
  });

  it('keeps static routes ahead of dynamic :id routes', async () => {
    const app = createRouteTestApp(cycleRoutes);

    const response = await request(app)
      .get('/api/calendar-events');

    expect(response.status).toBe(200);
    expect(response.body.events).toEqual([{ id: 'calendar-event' }]);
    expect(cycleController.getCalendarEvents).toHaveBeenCalledTimes(1);
    expect(cycleController.getCycle).not.toHaveBeenCalled();
  });

  it('validates create-cycle payloads before reaching the controller', async () => {
    const app = createRouteTestApp(cycleRoutes);

    const response = await request(app)
      .post('/api/')
      .send({ dateString: '2026-04-08' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
    expect(cycleController.createCycle).not.toHaveBeenCalled();
  });

  it('accepts a valid create-cycle payload through the full route stack', async () => {
    const app = createRouteTestApp(cycleRoutes);

    const response = await request(app)
      .post('/api/')
      .send({
        dateString: '2026-04-08',
        onah: 'night',
        notes: 'Flow test'
      });

    expect(response.status).toBe(201);
    expect(response.body.cycle).toMatchObject({
      dateString: '2026-04-08',
      onah: 'night',
      notes: 'Flow test'
    });
    expect(cycleController.createCycle).toHaveBeenCalledTimes(1);
  });

  it('validates bedikah payloads before controller execution', async () => {
    const app = createRouteTestApp(cycleRoutes);

    const response = await request(app)
      .post('/api/507f1f77bcf86cd799439011/bedikot')
      .send({
        date: {
          dateString: '2026-04-10',
          timeString: '08:30'
        },
        dayNumber: 9,
        timeOfDay: 'morning'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
    expect(cycleController.addBedika).not.toHaveBeenCalled();
  });
});
