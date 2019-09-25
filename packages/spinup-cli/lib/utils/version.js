const chalk = require('chalk');
const resolveCwd = require('resolve-cwd');

module.exports = function resolveVersions(pkgPath) {
    const cliVersion = require('../../package.json').version;
    const versions = [`@rebilly/spinup-cli v${cliVersion}`];

    if (pkgPath) {
        try {
            versions.push(...resolveProjectVersions(pkgPath));
        } catch (err) {
            versions.push('\nFailed to read installed gridsome version:');
            versions.push(chalk.red(err.message));
        }
    }

    return versions.join('\n');
};

function resolveProjectVersions(pkgPath) {
    const versions = [];

    const projectPkgJson = require(pkgPath);
    const {devDependencies = {}, dependencies = {}} = projectPkgJson;
    const packages = {...devDependencies, ...dependencies};

    if (packages.gridsome) {
        const version = resolvePackageVersion('gridsome');
        if (version) {
            versions.push(`gridsome v${version}`);
        }
    }

    return versions;
}

function resolvePackageVersion(name) {
    const pkgPath = resolveCwd.silent(`${name}/package.json`);
    const pkgJson = pkgPath ? require(pkgPath) : null;

    return pkgJson ? pkgJson.version : null
}
