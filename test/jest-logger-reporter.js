const fs = require('fs');
const path = require('path');

class JestLoggerReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this._logFile = this._options.logFile || 'test/logs/test.log';
    const dir = path.dirname(this._logFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const header = `\n==== Jest test run started: ${new Date().toISOString()} ====\n`;
    try { fs.appendFileSync(this._logFile, header); } catch (e) { /* ignore */ }
  }

  onTestResult(test, testResult, aggregatedResult) {
    const lines = [];
    lines.push(`\n-- File: ${test.path}`);
    testResult.testResults.forEach(tr => {
      const status = tr.status.toUpperCase();
      const duration = tr.duration != null ? `${tr.duration}ms` : 'n/a';
      lines.push(`${status}: ${tr.fullName} (${duration})`);
      if (tr.failureMessages && tr.failureMessages.length) {
        lines.push('Failure messages:');
        tr.failureMessages.forEach(m => lines.push(m));
      }
    });
    try { fs.appendFileSync(this._logFile, lines.join('\n') + '\n'); } catch (e) { /* ignore */ }

    // Append any IO logs (inputs/outputs) written by tests
    try {
      const ioLogPath = path.join(path.dirname(this._logFile), 'test_io.log');
      if (fs.existsSync(ioLogPath)) {
        const raw = fs.readFileSync(ioLogPath, 'utf8').trim();
        if (raw) {
          const entries = raw.split('\n').map(l => {
            try { return JSON.parse(l); } catch (e) { return null; }
          }).filter(Boolean).filter(e => {
            if (e.testFile === test.path) return true;
            try {
              const a = path.basename(e.testFile || '');
              const b = path.basename(test.path || '');
              return a && b && a === b;
            } catch (err) {
              return false;
            }
          });

          entries.forEach(e => {
            lines.push(`  [IO] Test: ${e.testName}`);
            if (e.input) lines.push(`    Input: ${JSON.stringify(e.input)}`);
            if (e.output) lines.push(`    Output: ${JSON.stringify(e.output)}`);
          });
          // also append the IO entries to the log file
          const ioText = entries.map(e => {
            const out = [`\n  [IO] Test: ${e.testName}`];
            if (e.input) out.push(`    Input: ${JSON.stringify(e.input)}`);
            if (e.output) out.push(`    Output: ${JSON.stringify(e.output)}`);
            return out.join('\n');
          }).join('\n');
          if (ioText) fs.appendFileSync(this._logFile, ioText + '\n');
        }
      }
    } catch (e) { /* ignore logging errors */ }
  }

  onRunComplete(contexts, results) {
    const summary = `\n==== Jest test run finished: ${new Date().toISOString()} ====\n` +
      `Passed: ${results.numPassedTests}, Failed: ${results.numFailedTests}, Total: ${results.numTotalTests}\n`;
    try { fs.appendFileSync(this._logFile, summary); } catch (e) { /* ignore */ }
  }
}

module.exports = JestLoggerReporter;
