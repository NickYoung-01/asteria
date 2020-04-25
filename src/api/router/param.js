'use strict';

module.exports.noteId = async (req, noteId) => {
    req.note = await req.currentUser.note(noteId);
};
