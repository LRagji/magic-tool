// Copyright © 2019 Baker Hughes, a GE company, LLC.  All rights reserved
const _logger = require('./lou-util');
const schematicsRelativePath = process.argv[1];
let schematics = require(schematicsRelativePath);
schematics = schematics.modules;

function main() {
    const componentAndPackages = new Map();
    _logger.log('Creating Modules');
    for (let modCounter = 0; modCounter < schematics.modules.length; modCounter++) {
        const mod = schematics.modules[modCounter];
        _logger.log('Parsing Module:' + mod.name);
        
    }
}
