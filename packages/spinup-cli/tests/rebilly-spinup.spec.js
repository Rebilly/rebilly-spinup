const path = require('path');
const execa = require('execa');

const cli = require.resolve('../bin/rebilly-spinup');

test('show @rebilly/spinup-cli version', async () => {
    const {stdout} = await execa(cli, ['-v']);
    expect(stdout).toMatch(/@rebilly\/spinup-cli v(\d+\.?){3}/);
});

test('warn about unknown command', async () => {
    const {stdout} = await execa(cli, ['foobar']);
    expect(stdout).toMatch('Unknown command foobar');
});

test('warn about missing dependencies', async () => {
    const {stdout} = await execa(cli, ['noop'], {
        cwd: path.join(__dirname, 'fixtures', 'project'),
    });
    expect(stdout).toMatch('install dependencies');
});
