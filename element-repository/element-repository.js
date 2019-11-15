const express = require('express')
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

class ElementRepository {
    constructor() {
        this.entryPoint = this.entryPoint.bind(this);
        this.fetchelement = this.fetchelement.bind(this);
        this.repoPath = "/Users/laukikragji/Documents/Git/Local/magic-tool/transpiler/elements/";
        this.port = 3000;
    }

    entryPoint(args) {
        this.repoPath = this.repoPath || args[1];
        this.port = this.port || args[2];
        app.use(bodyParser.urlencoded({ extended: false }))
        app.get('/v1/elements/:elementId', this.fetchelement)
        app.listen(this.port, () => console.log(`Elements repo active on ${this.port}!`))
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
                console.log("Fetched Element:" + elementId)
            }
            else {
                res.status(404).send('Cannot find element with id' + req.params.elementId.toLowerCase());
                console.warn("Missing Element:" + elementId)
            }
        }
        catch (ex) {
            res.status(500).send(ex);
        }
    }
}

const mainProgram = new ElementRepository();
mainProgram.entryPoint(process.argv);