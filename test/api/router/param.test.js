'use strict';

require('should');
const sinon = require('sinon');
const param = require('../../../src/api/router/param');

describe('Tests for api router param', () => {
    let req;

    beforeEach(() => {
        req = {};
    });

    describe('noteId', () => {
        let note;
        let user;

        beforeEach(() => {
            note = {};

            user = {
                note: sinon.stub().resolves(note),
            };

            req.currentUser = user;
        });

        it('should set the note in req if correct note id', async () => {
            await param.noteId(req, 20);

            req.currentUser.note.calledWithExactly(20).should.be.true();
            req.note.should.equal(note);
        });
    });
});
