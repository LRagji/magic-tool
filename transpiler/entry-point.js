// Copyright © 2019 Baker Hughes, a GE company, LLC.  All rights reserved
const configOptions = require('./magic-tool.json');
const fileSystem = require('fs');
const spawn = require('child_process').spawn;

async function main() {
    for (let cmdPointer = 0; cmdPointer < configOptions.project.commands.length; cmdPointer++) {
        const cmdlet = configOptions.project.commands[cmdPointer].cmd;
        const options = configOptions.project.commands[cmdPointer].options || {};
        const args = configOptions.project.commands[cmdPointer].args;
        console.log('\n\r \n\r' + '[' + cmdPointer + ']' + 'Executing Command:' + cmdlet + '\n\r');
        try {
            await runCommand(cmdlet, args, options);
        } catch (err) {
            console.log('Command Errored:' + JSON.stringify(err));
        }
    }
}

async function runCommand(command, args, options) {
    return new Promise((acc, rej) => {
        const cmd = spawn(command, args, options);
        cmd.stdout.on('data', data => {
            console.log(`${data}`);
        });

        cmd.stderr.on('data', data => {
            console.log(`${data}`);
        });

        cmd.on('close', code => {
            if (code === 0) {
                acc(code);
            } else {
                acc(code);
            }
        });
    });
}

main().then(() => console.log('Execution Done')).catch(err => console.log('Process level Catch:' + JSON.stringify(err)));
