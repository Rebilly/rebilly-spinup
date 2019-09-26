const execa = require('execa');
const semver = require('semver');

exports.hasYarn = async function () {
    try {
        const {stdout: version} = await execa('yarn', ['--version']);
        return semver.satisfies(version, '>= 1.4.0');
    } catch (err) {
    }
    return false;
};

exports.exec = function exec(cmd, args = [], options = {}, context = process.cwd()) {
    return execa(cmd, args, {
        stdio: options.stdio || 'ignore',
        cwd: context,
    });
};

exports.isGridsomeProject = function (pkgPath) {
    const projectPkgJson = pkgPath ? require(pkgPath) : {};
    const {devDependencies = {}, dependencies = {}} = projectPkgJson;
    const packages = {...devDependencies, ...dependencies};

    return packages.hasOwnProperty('gridsome');
};
