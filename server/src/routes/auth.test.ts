import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { AUTH_COOKIE_NAME } from '../utils/cookies.js';
import { UserModel } from '../models/User.js';

let mongod: MongoMemoryServer;

describe('Authentication & Security Integration Tests', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
      binary: {
        systemBinary:
          process.env.MONGOMS_SYSTEM_BINARY ||
          '/home/yousef/Your-Entire-Egypt-Trip-in-One-Place/node_modules/.cache/mongodb-memory-server/mongod-x64-fedora-8.2.6',
      },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  const testUser = {
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    password: 'SecurePassword123!',
  };

  it('registers a new user, hashes password with Argon2, and returns an httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      role: 'traveler',
    });
    // Strict requirement: passwordHash never leaves server
    expect(res.body.user.passwordHash).toBeUndefined();

    // Verify cookie attributes
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    const authCookie = cookies.find((c: string) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');
    expect(authCookie).toContain('SameSite=Lax');

    // Verify database record has valid Argon2 hash
    const savedUser = await UserModel.findOne({ email: testUser.email });
    expect(savedUser).not.toBeNull();
    expect(savedUser?.passwordHash).toMatch(/^\$argon2id\$/);
  });

  it('rejects duplicate email registration with HTTP 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.message).toContain('already exists');
  });

  it('rejects registration with invalid inputs (validation error)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        name: 'S',
        email: 'invalid-email',
        password: 'short',
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
  });

  it('logs in existing user, sets session cookie, and returns user profile', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();

    const cookies = res.headers['set-cookie'] as unknown as string[];
    const authCookie = cookies.find((c: string) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');
  });

  it('rejects invalid password with generic 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  it('rejects non-existent email with the same generic 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  it('GET /api/auth/me requires authentication and returns current user with valid cookie', async () => {
    // 1. Unauthenticated request fails with 401
    const unauthRes = await request(app).get('/api/auth/me');
    expect(unauthRes.status).toBe(401);
    expect(unauthRes.body.error.code).toBe('UNAUTHORIZED');

    // 2. Login to get cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const cookieHeader = loginRes.headers['set-cookie'] as unknown as string[];

    // 3. Authenticated request succeeds
    const authRes = await request(app).get('/api/auth/me').set('Cookie', cookieHeader);

    expect(authRes.status).toBe(200);
    expect(authRes.body.user.email).toBe(testUser.email);
    expect(authRes.body.user.passwordHash).toBeUndefined();
    expect(authRes.body.user.id).toBeDefined();
  });

  it('POST /api/auth/logout clears the authentication cookie', async () => {
    // First login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const cookieHeader = loginRes.headers['set-cookie'] as unknown as string[];

    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookieHeader);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toContain('Logged out');

    // Verify cookie was cleared (expires in past / empty)
    const cookies = logoutRes.headers['set-cookie'] as unknown as string[];
    const clearedCookie = cookies.find((c: string) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    expect(clearedCookie).toBeDefined();
    expect(clearedCookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
  });
});
