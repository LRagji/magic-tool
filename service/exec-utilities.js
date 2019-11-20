const serviceNames = require('./service-names');
const spawn = require('child_process').spawn;
const createSymlink = require('create-symlink');
const path = require('path');

module.exports = class Utilities {

    constructor(dependencyContainer) {
        this._logger = dependencyContainer.get(serviceNames.loggerService);
        this._executeShell = this._executeShell.bind(this);
        this._npmInstall = this._npmInstall.bind(this);
        this.npxCommand = 'npx';
        this.npmCommand = 'npm';
    }

    async _executeShell(command, args, options) {
        return new Promise((acc, rej) => {
            options.shell = true;
            const cmd = spawn(command, args, options);
            cmd.stdout.on('data', data => {
                this._logger.dim(`${data}`);
            });

            cmd.stderr.on('data', data => {
                this._logger.dim(`${data}`);
            });

            cmd.on('error', err => {
                this._logger.dim(`${err}`);
                rej(err);
            });

            cmd.on('exit', (code, signal) => {
                if (code === 0) {
                    acc(code);
                } else {
                    rej({ 'code': code, 'signal': signal });
                }
                cmd.stdin.end();
            });
        });
    }

    async _npmInstall(projectPath, schematicPackagePath, cacheCopy = undefined) {
        if (cacheCopy !== undefined) {
            await createSymlink(cacheCopy, path.join(projectPath + "/node_modules"), { type: 'junction' });
        }
        else {
            //RUN Complete NPM Install
            await this._executeShell(this.npmCommand, [
                'install',
                '--verbose'
            ], { 'cwd': projectPath });
        }

        //Do schematics install
        await this._executeShell(this.npmCommand, [
            'install',
            schematicPackagePath,
        ], { 'cwd': projectPath });
    }
}