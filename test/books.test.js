const request = require('supertest');
const app = require('../src/index');
const setupTestDB = require('./test-setup');
const logger = require('./logger');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await setupTestDB();
});

describe('Books API', () => {
  test('GET /dratavlibrary/books returns paginated books', async () => {
    const url = '/dratavlibrary/books?page=1&limit=5';
    const res = await request(app).get(url);
    logger.append({ testFile: __filename, testName: 'GET /dratavlibrary/books returns paginated books', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
    expect(res.body.data.length).toBe(5);
  });

  test('Search books by title', async () => {
    const url = '/dratavlibrary/books?search=Midnight';
    const res = await request(app).get(url);
    logger.append({ testFile: __filename, testName: 'Search books by title', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toMatch(/Midnight/);
  });

  test('Search books by author name', async () => {
    const url = '/dratavlibrary/books?author=Alice';
    const res = await request(app).get(url);
    logger.append({ testFile: __filename, testName: 'Search books by author name', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('Checkout and return flow', async () => {
    const listUrl = '/dratavlibrary/books?search=Midnight';
    const list = await request(app).get(listUrl);
    logger.append({ testFile: __filename, testName: 'Checkout and return flow - list', input: { url: listUrl }, output: { status: list.status, body: list.body } });
    const id = list.body.data[0].id;
    const checkoutUrl = `/dratavlibrary/books/${id}/checkout`;
    const c = await request(app).post(checkoutUrl);
    logger.append({ testFile: __filename, testName: 'Checkout and return flow - checkout', input: { url: checkoutUrl }, output: { status: c.status, body: c.body } });
    expect(c.status).toBe(200);
    expect(c.body.checkedOut).toBe(true);

    const returnUrl = `/dratavlibrary/books/${id}/return`;
    const r = await request(app).post(returnUrl);
    logger.append({ testFile: __filename, testName: 'Checkout and return flow - return', input: { url: returnUrl }, output: { status: r.status, body: r.body } });
    expect(r.status).toBe(200);
    expect(r.body.checkedOut).toBe(false);
  });

  test('Create, update and delete a book', async () => {
    // Create
    const createUrl = '/dratavlibrary/books';
    const payload = { title: 'Unit Test Book', pageCount: 123, releaseDate: '2025-01-01T00:00:00.000Z', author: { firstName: 'Test', lastName: 'Author' } };
    const createRes = await request(app).post(createUrl).send(payload);
    logger.append({ testFile: __filename, testName: 'Create book', input: { url: createUrl, body: payload }, output: { status: createRes.status, body: createRes.body } });
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeDefined();
    const bookId = createRes.body.id;

    // Update
    const updateUrl = `/dratavlibrary/books/${bookId}`;
    const updatePayload = { title: 'Unit Test Book Updated', pageCount: 200 };
    const updateRes = await request(app).put(updateUrl).send(updatePayload);
    logger.append({ testFile: __filename, testName: 'Update book', input: { url: updateUrl, body: updatePayload }, output: { status: updateRes.status, body: updateRes.body } });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe(updatePayload.title);

    // Delete
    const deleteUrl = `/dratavlibrary/books/${bookId}`;
    const deleteRes = await request(app).delete(deleteUrl);
    logger.append({ testFile: __filename, testName: 'Delete book', input: { url: deleteUrl }, output: { status: deleteRes.status, body: deleteRes.body } });
    expect(deleteRes.status).toBe(204);

    // Confirm deletion
    const getRes = await request(app).get(`/dratavlibrary/books/${bookId}`);
    logger.append({ testFile: __filename, testName: 'Get deleted book', input: { url: `/dratavlibrary/books/${bookId}` }, output: { status: getRes.status, body: getRes.body } });
    expect(getRes.status).toBe(404);
  });

  test('Create book with invalid payload returns 400', async () => {
    const url = '/dratavlibrary/books';
    const payload = { title: '', pageCount: -5 };
    const res = await request(app).post(url).send(payload);
    logger.append({ testFile: __filename, testName: 'Create book invalid payload', input: { url, body: payload }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid payload');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('Update book with invalid payload returns 400', async () => {
    // create a valid book first
    const createRes = await request(app).post('/dratavlibrary/books').send({ title: 'TmpBook', pageCount: 10 });
    const id = createRes.body.id;
    const url = `/dratavlibrary/books/${id}`;
    const payload = { pageCount: -1 };
    const res = await request(app).put(url).send(payload);
    logger.append({ testFile: __filename, testName: 'Update book invalid payload', input: { url, body: payload }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid payload');
  });

  test('Delete non-existing book returns 404', async () => {
    const url = '/dratavlibrary/books/999999';
    const res = await request(app).delete(url);
    logger.append({ testFile: __filename, testName: 'Delete non-existing book', input: { url }, output: { status: res.status, body: res.body } });
    expect(res.status).toBe(404);
  });

  test('Creating duplicate book returns 409', async () => {
    const url = '/dratavlibrary/books';
    const payload = { title: 'Duplicate Test Book', pageCount: 111, author: { firstName: 'Dup', lastName: 'Tester' } };
    const r1 = await request(app).post(url).send(payload);
    logger.append({ testFile: __filename, testName: 'Create duplicate - first create', input: { url, body: payload }, output: { status: r1.status, body: r1.body } });
    expect(r1.status).toBe(201);

    const r2 = await request(app).post(url).send(payload);
    logger.append({ testFile: __filename, testName: 'Create duplicate - second create', input: { url, body: payload }, output: { status: r2.status, body: r2.body } });
    expect(r2.status).toBe(409);
    expect(r2.body).toHaveProperty('error', 'Book already exists');
  });
});
