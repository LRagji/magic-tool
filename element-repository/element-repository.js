const express = require('express')
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const defaultPort = 3000;
const defaultPath = "/Users/laukikragji/Documents/Git/Local/magic-tool/transpiler/elements/";

class ElementRepository {
    constructor() {
        this.entryPoint = this.entryPoint.bind(this);
        this.fetchelement = this.fetchelement.bind(this);
    }

    entryPoint(args) {
        this.repoPath = args[2] || process.env.REPOPATH || defaultPath;
        this.port = args[3] || process.env.REPOPORT || defaultPort;
        app.use(bodyParser.urlencoded({ extended: false }))
        app.get('/v1/elements/:elementId', this.fetchelement)
        app.listen(this.port, () => console.log(`Elements repo active on ${this.port}! with repo from:${this.repoPath}`))
    }

    fetchelement(req, res) {
        try {
            const elementId = req.params.elementId.toLowerCase();
            const elementPath = path.join(this.repoPath, (elementId + ".js"));
            if (fs.existsSync(elementPath)) {
                let options = {
                    dotfiles: 'deny',
                    headers: {
                        'Content-Type': 'text/plain '
                    }
                }
                res.sendFile(elementPath, options);
            }
            else {
                res.status(404).send('Cannot find element with id: ' + req.params.elementId.toLowerCase());
                console.warn("Missing Element:" + elementId + "@" + elementPath)
            }
        }
        catch (ex) {
            res.status(500).send(ex);
        }
    }
}

const mainProgram = new ElementRepository();
mainProgram.entryPoint(process.argv);