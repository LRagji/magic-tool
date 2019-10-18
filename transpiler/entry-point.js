// Copyright © 2019 Baker Hughes, a GE company, LLC.  All rights reserved
const configOptions = require('./.magic-tool.json');
const _logger = require('./log-util');
const _angular = require('./angular');
const _di = require('./dependency-injector');
const spawn = require('child_process').spawn;
const parser = require('./layout-parser');
const fs = require('fs-extra'); //TODO Need to replace this with fs-promise api when out of experimental
const path = require('path');
const serviceNames = require('./service-names');
const elementsRepo = require('./templates/elements');

const context = new _di();
context.register(serviceNames.executorService, runCommand);
context.register(serviceNames.loggerService, _logger);
context.register(serviceNames.fileSystemService, fs);
context.register(serviceNames.pathService, path);
context.register(serviceNames.elementsRepo, elementsRepo);
context.register(serviceNames.jsonReader, require('jsonfile'));
context.register(serviceNames.toolRootDirectory, path.join(process.argv[1], '../../'));

const builder = new _angular(context);
context.register(serviceNames.parser, new parser(context));

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

builder.createProject(configOptions).then(async longRunningProcesses => {
    if (Array.isArray(longRunningProcesses)) {
        _logger.log('Waiting for background processes..');
        await Promise.All(longRunningProcesses);
    }
    _logger.log('Execution Complete.');
}).catch(err => _logger.log('Process level Catch: ' + (err instanceof Error ? err.toString() : JSON.stringify(err))));
