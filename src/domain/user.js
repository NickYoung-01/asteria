'use strict';

const _ = require('lodash');
const model = require('../model');
const domain = require('../domain');

class User {
    constructor(user) {
        this._user = user;
    }

    get id() {
        return this._user.id;
    }

    expose() {
        return _.pick(this._user, [
            'id',
            'name'
        ]);
    }

    async authenticate(password) {
        if (!await this._user.verifyPassword(password)) {
            throw new domain.Error(domain.Error.Code.AUTHENTICATION_FAILED);
        }
    }

    async notes() {
        const notes = await this._user.getNotes({
            order: [
                ['updatedAt', 'DESC']
            ],
        });
        return _.map(notes, note => new domain.Note(note));
    }

    async note(id) {
        const notes = await this._user.getNotes({
            where: {
                id
            },
        });
        if (_.size(notes) !== 1) {
            throw new domain.Error(domain.Error.Code.NOTE_NOT_FOUND);
        }
        return new domain.Note(_.head(notes));
    }

    async createNote(note) {
        const createdNote = await this._user.createNote(note);
        return new domain.Note(createdNote);
    }

    static async getById(id) {
        const modelUser = await model.User.findOne({
            where: {
                id
            }
        });
        if (!modelUser) {
            throw new domain.Error(domain.Error.Code.USER_NOT_FOUND);
        }
        return new User(modelUser);
    }

    static async getByName(name) {
        const modelUser = await model.User.findOne({
            where: {
                name
            }
        });
        if (!modelUser) {
            throw new domain.Error(domain.Error.Code.USER_NOT_FOUND);
        }
        return new User(modelUser);
    }
}

module.exports = User;
