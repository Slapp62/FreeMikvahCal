# Backend Testing

## Commands

- `npm test`: run the whole backend suite once, serially, with coverage.
- `npm run test:watch`: watch mode for local development.
- `npm run test:flow`: run only flow-style tests (`*.flow.test.js`).
- `npm run test:routes`: run route-stack tests.

## Test Layers

- Unit tests: pure calculation or service logic with direct module imports.
- Route flow tests: exercise route ordering, auth middleware, validation, and controller wiring with Supertest.

## Reusable Helper

Use [create-route-test-app.js](/C:/Users/simch/Documents/Coding/freeMikvahCal/backend/test/helpers/create-route-test-app.js) to mount a route module with:

- JSON body parsing
- stubbed `req.isAuthenticated()`
- stubbed `req.user`
- stubbed `req.login()`, `req.logout()`, and `req.session.destroy()`
- a simple JSON error handler

This lets you test route behavior without booting the full production app or touching MongoDB.

## Naming Convention

- `*.test.js`: unit-style tests
- `*.flow.test.js`: end-to-end route or workflow tests that cover more than one layer
