// Copyright © 2019 Baker Hughes, a GE company, LLC.  All rights reserved
const configOptions = require('./magic-tool.json');
const _logger = require('./lou-util');
const spawn = require('child_process').spawn;

async function main() {
    const backgroundProcess = [];
    for (let cmdPointer = 0; cmdPointer < configOptions.project.commands.length; cmdPointer++) {
        const cmdlet = configOptions.project.commands[cmdPointer].cmd;
        const options = configOptions.project.commands[cmdPointer].options || {};
        const args = configOptions.project.commands[cmdPointer].args;
        const isBackgroundProcess = configOptions.project.commands[cmdPointer].keepRunningInBackgroud;
        _logger.log('\n\r \n\r' + '[' + cmdPointer + ']' + 'Executing Command:' + cmdlet + '\n\r');
        try {
            if (isBackgroundProcess === false) {
                await runCommand(cmdlet, args, options);
            } else {
                backgroundProcess.push(runCommand(cmdlet, args, options));
            }
        } catch (err) {
            _logger.log('Command Errored:' + JSON.stringify(err));
        }
    }

    return backgroundProcess;
}

async function runCommand(command, args, options) {
    return new Promise((acc, rej) => {
        const cmd = spawn(command, args, options);
        cmd.stdout.on('data', data => {
            _logger.log(`${data}`);
        });

        cmd.stderr.on('data', data => {
            _logger.log(`${data}`);
        });

        cmd.on('close', code => {
            if (code === 0) {
                acc(code);
            } else {
                rej(code);
            }
        });
    });
}

main().then(longRunningProcesses => {
    _logger.log('Execution Done, waiting for background processes');
    Promise.All(longRunningProcesses);
}).catch(err => _logger.log('Process level Catch:' + JSON.stringify(err)));
