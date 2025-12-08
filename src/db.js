const { Sequelize } = require('sequelize');

function createSequelize() {
  if (process.env.NODE_ENV === 'test') {
    return new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
  }

  const dialect = process.env.DB_DIALECT || 'mysql';
  const database = process.env.DB_NAME || 'dratavlibrary';
  const username = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || 'password';
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    logging: false,
  });
}

module.exports = createSequelize();
