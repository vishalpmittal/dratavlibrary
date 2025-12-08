const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const models = require('./models');

const app = express();
app.use(bodyParser.json());
app.use(routes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // wait for DB to be ready with retries (useful for docker-compose startup ordering)
    const maxAttempts = parseInt(process.env.DB_CONNECT_RETRIES || '12', 10);
    const delayMs = parseInt(process.env.DB_CONNECT_DELAY_MS || '2000', 10);
    let attempt = 0;
    while (true) {
      try {
        attempt += 1;
        await models.sequelize.authenticate();
        break; // success
      } catch (err) {
        if (attempt >= maxAttempts) {
          console.error(`Failed to connect to DB after ${attempt} attempts`);
          throw err;
        }
        console.log(`Database not ready (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    await models.sequelize.sync();
    app.listen(PORT, () => {
      console.log(`DrataVLibrary listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
