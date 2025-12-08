const request = require('supertest');
const app = require('../src/index');
const setupTestDB = require('./test-setup');
const logger = require('./logger');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await setupTestDB();
});

describe('Authors API', () => {
  test('GET /dratavlibrary/authors returns paginated authors', async () => {
    const url = '/dratavlibrary/authors?page=1&limit=5';
    const res = await request(app).get(url);
    logger.append({ testFile: __filename, testName: 'GET /dratavlibrary/authors returns paginated authors', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
  });

  test('Search authors by name', async () => {
    const url = '/dratavlibrary/authors?search=Alice';
    const res = await request(app).get(url);
    logger.append({ testFile: __filename, testName: 'Search authors by name', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(200);
    expect(res.body.data[0].firstName).toMatch(/Alice/);
  });

  test('Authors listed via book name', async () => {
    const url = '/dratavlibrary/authors?book=Midnight';
    const res = await request(app).get(url);
    logger.append({ testFile: __filename, testName: 'Authors listed via book name', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Create author with invalid payload returns 400', async () => {
    const url = '/dratavlibrary/authors';
    const payload = { firstName: '', lastName: '' };
    const res = await request(app).post(url).send(payload);
    logger.append({ testFile: __filename, testName: 'Create author invalid payload', input: { url, body: payload }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid payload');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('Update author with invalid payload returns 400', async () => {
    // create a valid author first
    const createRes = await request(app).post('/dratavlibrary/authors').send({ firstName: 'Tmp', lastName: 'Author' });
    const id = createRes.body.id;
    const url = `/dratavlibrary/authors/${id}`;
    const payload = { firstName: '' };
    const res = await request(app).put(url).send(payload);
    logger.append({ testFile: __filename, testName: 'Update author invalid payload', input: { url, body: payload }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid payload');
  });

  test('Delete non-existing author returns 404', async () => {
    const url = '/dratavlibrary/authors/999999';
    const res = await request(app).delete(url);
    logger.append({ testFile: __filename, testName: 'Delete non-existing author', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(404);
  });
});
