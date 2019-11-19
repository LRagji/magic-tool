const serviceNames = require('./service-names');
const spawn = require('child_process').spawn;

module.exports = class Utilities {

    constructor(dependencyContainer) {
        this._logger = dependencyContainer.get(serviceNames.loggerService);
        this._executeShell = this._executeShell.bind(this);
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
}