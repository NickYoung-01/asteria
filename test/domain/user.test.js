'use strict';

const _ = require('lodash');
require('should');
const domain = require('../../src/domain');
const model = require('../../src/model');

describe('Tests for domain User', () => {
    let userId1;
    let noteId1;
    let userId2;

    beforeEach(async () => {
        await model.sequelize.sync({
            force: true
        });

        await Promise.all([
            (async () => {
                const user = await model.User.createUser('user1', 'password1');
                userId1 = user.id;

                const notes = await Promise.all(_.map(_.times(5, n => ({
                    subject: `subject ${ n }`,
                    body: `body ${ n }`,
                })), note => user.createNote(note)));
                noteId1 = _.first(notes).id;
            })(),
            (async () => {
                userId2 = (await model.User.createUser('user2', 'password2')).id;
            })(),
        ]);
    });

    describe('static method', () => {
        describe('getById', () => {
            it('should get a user by its id', async () => {
                const user = await domain.User.getById(userId1);
                user.should.be.instanceOf(domain.User);
            });

            it('should reject USER_NOT_FOUND if wrong id', async () => {
                await domain.User.getById(-1).should.be.rejectedWith(domain.Error.Code.USER_NOT_FOUND.name);
            });
        });

        describe('getByName', () => {
            it('should get a user by its name', async () => {
                const user = await domain.User.getByName('user1');
                user.should.be.instanceOf(domain.User);
            });

            it('should reject USER_NOT_FOUND if wrong name', async () => {
                await domain.User.getByName('wrong name').should.be.rejectedWith(domain.Error.Code.USER_NOT_FOUND.name);
            });
        });
    });

    describe('instance method', () => {
        let domainUser1;
        let domainUser2;

        beforeEach(async () => {
            domainUser1 = await domain.User.getById(userId1);
            domainUser2 = await domain.User.getById(userId2);
        });

        describe('getters', () => {
            it('should get the id', () => {
                domainUser1.id.should.equal(userId1);
            });
        });

        describe('expose', () => {
            it('should expose the id and the name of the user', () => {
                domainUser1.expose().should.eql({
                    id: userId1,
                    name: 'user1',
                });
            });
        });

        describe('authenticate', () => {
            it('should fulfill if correct password', async () => {
                await domainUser1.authenticate('password1').should.be.fulfilled();
            });

            it('should reject AUTHENTICATION_FAILED if wrong password', async () => {
                await domainUser1.authenticate('wrong password').should.be.rejectedWith(domain.Error.Code.AUTHENTICATION_FAILED.name);
            });
        });

        describe('notes', () => {
            it('should return the Notes asociated with the User', async () => {
                const notes = await domainUser1.notes();

                notes.should.have.size(5);
                _.each(notes, note => {
                    note.should.be.instanceOf(domain.Note);
                });
            });

            it('should return an empty array if no Notes', async () => {
                (await domainUser2.notes()).should.be.empty();
            });
        });

        describe('note', () => {
            it('should return a note by its id', async () => {
                const note = await domainUser1.note(noteId1);
                note.should.be.instanceOf(domain.Note);
            });

            it('should reject NOTE_NOT_FOUND if wrong id', async () => {
                await domainUser2.note(noteId1).should.be.rejectedWith(domain.Error.Code.NOTE_NOT_FOUND.name);
            });
        });

        describe('createNote', () => {
            it('should create a new note associated to the user', async () => {
                const createdNote = await domainUser1.createNote({
                    subject: 'new subject',
                    body: 'new body'
                });

                await domainUser1.note(createdNote.id).should.be.fulfilled();
            });
        });
    });
});
