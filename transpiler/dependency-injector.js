// Copyright © 2019 Baker Hughes, a GE company, LLC.  All rights reserved
module.exports = class context {
    constructor() {
        this._register = new Map();
        this.register = this.register.bind(this);
    }

    register(key, instance) {
        this._register.set(key, instance);
    }

    get(key) {
        return this._register.get(key);
    }
}