import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.js';
import { env } from './config/env.js';

describe('Server Foundation & Health', () => {
  it('GET /api/health returns 200 with ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      environment: env.nodeEnv,
    });
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('rejects state-mutating requests with forbidden when Origin does not match CLIENT_ORIGIN', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Origin', 'https://malicious-site.com')
      .set('Content-Type', 'application/json')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('unauthorized origin');
  });

  it('rejects state-mutating requests attempting HTML form submission', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('field=value');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toContain('HTML form submissions are not supported');
  });

  it('rejects state-mutating requests with payload missing application/json content-type', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'text/plain')
      .send('plain text payload');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toContain('Content-Type header must be application/json');
  });
});
