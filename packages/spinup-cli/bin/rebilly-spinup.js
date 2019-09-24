#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const program = require('commander');
const didYouMean = require('didyoumean');
const resolveCwd = require('resolve-cwd');
const updateNotifier = require('update-notifier');
const shell = require('shelljs');
const resolveVersions = require('../lib/utils/version');
const pkgPath = require('find-up').sync('package.json');
const {hasYarn} = require('../lib/utils');

const pkg = require('../package.json');
const notifier = updateNotifier({pkg});

const context = pkgPath ? path.resolve(path.dirname(pkgPath)) : process.cwd();
const version = resolveVersions(pkgPath);

const cliCommands = ['create', 'build', 'develop', 'explore'];

// version
program
    .version(version, '-v, --version')
    .usage('<command> [options]');

// create
program
    .command('create <name> [starter]')
    .description('create a new website')
    .action((...args) => {
        const create = require('../lib/commands/create');
        return wrapCommand(create)(...args);
    });


let hasGridsomeActions;

try {
    hasGridsomeActions = resolveCwd.silent('gridsome');
} catch (err) {
    console.log(err);
}

program
    .command('develop')
    .description('start development server')
    .option('-p, --port <port>', 'use specified port (default: 8080)')
    .option('-h, --host <host>', 'use specified host (default: 0.0.0.0)')
    .action(args => {
        if(hasGridsomeActions) {
            // do actual gridsome
        }
        console.log('dev', args.port);
    });

program
    .command('build')
    .description('build site for production')
    .action(() => {
        const executor = resolveCwd('@gridsome/cli');
        console.log('build', hasGridsomeActions);
        // shell.exec(`node ${executor} create test`);
    });

program
    .command('explore')
    .description('explore GraphQL data')
    .option('-p, --port <port>', 'use specified port (default: 8080)')
    .option('-h, --host <host>', 'use specified host (default: 0.0.0.0)')
    .action(args => {
        console.log('explore', args);
    });

program
    .command('serve')
    .description('start a production node.js server')
    .option('-p, --port <port>', 'use specified port (default: 8080)')
    .option('-h, --host <host>', 'use specified host (default: 0.0.0.0)')
    .action(args => {
        console.log('serve', args);
    });

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

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

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
