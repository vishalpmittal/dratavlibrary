# vibelibrary

A simple Node.js + MySQL book tracking application.

**Tech stack**: Node.js, Express, Sequelize, MySQL

**Prerequisites**

- Node
    ```bash
    # install if not present
    brew install node
    ```
- Docker
    ```bash
    # install if not present
    brew install docker
    ```

**Run application locally**

Using Docker Compose:

```bash
# Build and start MySQL + app (app will wait until DB is ready)
docker-compose up --build
```

The API will be available at `http://localhost:3000`.

API root path prefix: `/vibelibrary`

Examples:
- `POST /vibelibrary/books` - create a new book with payload
    ```
    {"title":"Unit Test Book","pageCount":123,"releaseDate":"2025-01-01T00:00:00.000Z","author":{"firstName":"Test","lastName":"Author"}}
    ```
- `GET /vibelibrary/books?page=1&limit=10&search=Midnight` - paginated book list
- `GET /vibelibrary/authors?search=Alice` - paginated author list
- `POST /vibelibrary/books/:id/checkout` - checkout a book

**Run Tests locally**

Running tests (uses sqlite in-memory):

```bash
cd <application-folder>
npm install --no-audit --no-fund
npm test
```
The test logs can be viewed at `vibelibrary/test/logs/test.log`


**API Documentation**

- Swagger/OpenAPI file is at `openapi.yaml`.
