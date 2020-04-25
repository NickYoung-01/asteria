'use strict';

const _ = require('lodash');

module.exports.create = async (req, res) => {
    const note = await req.currentUser.createNote(req.body);
    res.json(note.expose());
};

module.exports.list = async (req, res) => {
    const notes = await req.currentUser.notes();
    res.json(_.invokeMap(notes, 'expose'));
};

module.exports.get = async (req, res) => {
    res.json(req.note.expose());
};

module.exports.update = async (req, res) => {
    await req.note.update(req.body);
    res.json(req.note.expose());
};

module.exports.delete = async (req, res) => {
    await req.note.delete();
    res.sendStatus(204);
};
