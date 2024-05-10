const { match, rejects, strictEqual: eq } = require('node:assert');
const { describe, it } = require('zunit');

const { napiAsync: napi } = require('..');

describe('napi-async', () => {
  it('should execute a command without arguments', async () => {
    const output = await napi().ls();
    match(output, /napi@\d+\.\d+\.\d+/);
    match(output, /zunit@\d+\.\d+\.\d+/);
  });

  it('should execute a command with simple arguments', async () => {
    const output = await napi().view('express', 'version');
    match(output, /\d+\.\d+\.\d+/);
  });

  it('should execute a command with long options', async () => {
    const output = await napi().ls({ omit: 'dev', json: true, long: undefined });
    const report = JSON.parse(output);
    eq(Object.keys(report).includes('dependencies'), false);
    eq(report.description, 'A programmatic api for npm');
  });

  it('should support exec options', async () => {
    const output = await napi({ cwd: __dirname }).exec('-c', 'pwd');
    match(output, new RegExp('/napi/test$'));
  });

  it('should report commands that fail', async () => {
    await rejects(() => napi().exec('test', 'a = b'), (err) => {
      eq(err.message, 'Command failed: npm exec test a = b\n');
      return true;
    });
  });

  it('should capture stderr', async () => {
    await rejects(() => napi().view('asdfasdfasdflsdfweifwefsdf'), (err) => {
      match(err.message, /Command failed: npm view asdfasdfasdflsdfweifwefsdf/);
      match(err.stderr.toString(), /npm ERR! code E404/);
      return true;
    });
  });
});
