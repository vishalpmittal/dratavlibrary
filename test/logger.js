const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const ioLogFile = path.join(logsDir, 'test_io.log');

function append(entry) {
  try {
    fs.appendFileSync(ioLogFile, JSON.stringify(entry) + '\n');
  } catch (e) {
    // ignore logging errors in tests
  }
}

module.exports = { append, ioLogFile };
