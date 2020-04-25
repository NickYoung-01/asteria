'use strict';

const _ = require('lodash');

class Note {
    constructor(note) {
        this._note = note;
    }

    get id() {
        return this._note.id;
    }

    expose() {
        return _.pick(this._note, [
            'id',
            'subject',
            'body',
            'updatedAt',
        ]);
    }

    async update(note) {
        await this._note.update(note);
    }

    async delete() {
        await this._note.destroy();
    }
}

module.exports = Note;
