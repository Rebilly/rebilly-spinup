const execa = require('execa');
const semver = require('semver');

exports.hasYarn = async function hasYarn() {
    try {
        const {stdout: version} = await execa('yarn', ['--version']);
        return semver.satisfies(version, '>= 1.4.0');
    } catch (err) {
        // do nothing
    }
    return false;
};

exports.exec = function exec(cmd, args = [], options = {}, context = process.cwd()) {
    return execa(cmd, args, {
        stdio: options.stdio || 'ignore',
        cwd: context,
        shell: options.shell || false,
    });
};

exports.isGridsomeProject = function isGridsomeProject(pkgPath) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const projectPkgJson = pkgPath ? require(pkgPath) : {};
    const {devDependencies = {}, dependencies = {}} = projectPkgJson;
    const packages = {...devDependencies, ...dependencies};
    return Object.prototype.hasOwnProperty.call(packages, 'gridsome');
};
