#!/usr/bin/env node

const chalk = require('chalk');
const program = require('commander');
const didYouMean = require('didyoumean');
const resolveCwd = require('resolve-cwd');
const updateNotifier = require('update-notifier');
const resolveVersions = require('../lib/utils/version');
const pkgPath = require('find-up').sync('package.json');
const {hasYarn, exec} = require('../lib/utils');

const pkg = require('../package.json');
// registry checker for new CLI version
const notifier = updateNotifier({pkg});
const version = resolveVersions(pkgPath);
const cliCommands = ['create', 'build', 'develop', 'explore'];

// version
program
    .version(version, '-v, --version')
    .usage('<command> [options]');

// create
program
    .command('create <name> [template]')
    .description('spinup a new website')
    .action((...args) => {
        // executes from CLI's scope and doesn't require external
        // dependencies
        const create = require('../lib/commands/create');
        return wrapCommand(create)(...args);
    });

let hasGridsomeActions;
try {
    // check for gridsome install globally or within current folder
    hasGridsomeActions = resolveCwd.silent('gridsome') !== null;
} catch (err) {
    console.log(err);
}

/**
 * Wrap a command to execute the right delegate (global, local) and regenerate
 * its intended parameters.
 * @param {string} cmd
 * @param {{}?} params
 * @returns {Promise<void>|undefined}
 */
const delegateCommand = async (cmd, params = null) => {
    let compiledParams = [];
    if (params) {
        // build `--port 9900 --host 4.4.4.4` as an array
        Object.entries(params).forEach(([flag, value]) => {
            if (value) {
                compiledParams = [...compiledParams, `--${flag}`, value];
            }
        });
    }
    if (hasGridsomeActions) {
        try {
            // found global install or within folder
            await exec(`gridsome ${cmd}`, compiledParams, {
                shell: true,
                // output stdout to current context and ignore everything else
                stdio: ['ignore', process.stdout, 'ignore'],
            });
        } catch(err) {
            console.error(chalk.red(err.stack));
            process.exitCode = 1;
        }
    } else {
        console.log(chalk.red(`Unable to execute command ${chalk.bold(cmd)}`));
        console.log(chalk.red(`It's possible the current folder does not contain a compatible website`));
    }
};

// transposed from Gridsome's main package
program
    .command('develop')
    .description('start development server (Gridsome)')
    .option('-p, --port <port>', 'use specified port (default: 8080)')
    .option('-h, --host <host>', 'use specified host (default: 0.0.0.0)')
    .action(({port, host}) => delegateCommand('develop', {port, host}));

program
    .command('build')
    .description('build site for production (Gridsome)')
    .action(() => delegateCommand('build'));

program
    .command('explore')
    .description('explore GraphQL data (Gridsome)')
    .option('-p, --port <port>', 'use specified port (default: 8080)')
    .option('-h, --host <host>', 'use specified host (default: 0.0.0.0)')
    .action(({port, host}) => delegateCommand('explore', {port, host}));

program
    .command('serve')
    .description('start a production node.js server (Gridsome)')
    .option('-p, --port <port>', 'use specified port (default: 8080)')
    .option('-h, --host <host>', 'use specified host (default: 0.0.0.0)')
    .action(({port, host}) => delegateCommand('serve', {port, host}));

// show a warning if the command does not exist
program.arguments('<command>').action(async command => {
    const {isGridsomeProject, hasYarn} = require('../lib/utils');
    const suggestion = didYouMean(command, cliCommands);
    if (isGridsomeProject(pkgPath) && !suggestion) {
        const useYarn = await hasYarn();
        console.log();
        console.log(`  Please run ${chalk.cyan(useYarn ? 'yarn' : 'npm install')} to install dependencies first.`);
        console.log();
    } else {
        console.log(chalk.red(`Unknown command ${chalk.bold(command)}`));
        if (suggestion) {
            console.log();
            console.log(`Did you mean ${suggestion}?`);
        }
    }
});

// help
program.on('--help', () => {
    console.log();
    console.log(`  Run ${chalk.cyan('rebilly-spinup <command> --help')} for detailed usage of given command.`);
    console.log();
});

// load flags into commands
program.parse(process.argv);

// no flags detected
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

// check if a newer version of the CLI exists on the registry
if (notifier.update) {
    (async () => {
        const withYarn = await hasYarn();
        const margin = chalk.bgGreen(' ');
        const command = withYarn ? `yarn add global ${pkg.name}` : `npm i -g ${pkg.name}`;
        console.log();
        console.log(`${margin} Update available: ${chalk.bold(notifier.update.latest)}`);
        console.log(`${margin} Run ${chalk.cyan(command)} to update`);
        console.log();
    })();
}

function wrapCommand(fn) {
    return (...args) => {
        return fn(...args).catch(err => {
            console.error(chalk.red(err.stack));
            process.exitCode = 1;
        });
    };
}
