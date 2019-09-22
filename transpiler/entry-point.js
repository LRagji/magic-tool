// Copyright © 2019 Baker Hughes, a GE company, LLC.  All rights reserved
const configOptions = require('./.magic-tool.json');
const _logger = require('./log-util');
const _angular = require('./angular');
const _di = require('./dependency-injector');
const spawn = require('child_process').spawn;

const executorService = 'shell';
const loggerService = 'logger';
const context = new _di();
context.register(executorService, runCommand);
context.register(loggerService, _logger);
const builder = new _angular(context);

async function runCommand(command, args, options) {
    return new Promise((acc, rej) => {
        const cmd = spawn(command, args, options);
        cmd.stdout.on('data', data => {
            _logger.log(`${data}`);
        });

        cmd.stderr.on('data', data => {
            _logger.log(`${data}`);
        });

        cmd.on('error', err => {
            _logger.log(`${err}`);
            rej(code);
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

builder.createProject(configOptions).then(async longRunningProcesses => {
    if (Array.isArray(longRunningProcesses)) {
        _logger.log('Waiting for background processes..');
        await Promise.All(longRunningProcesses);
    }
    _logger.log('Execution Complete.');
}).catch(err => _logger.log('Process level Catch:' + JSON.stringify(err)));
