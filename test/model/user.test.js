'use strict';

require('should');
const model = require('../../src/model');

describe('Tests for model User', () => {
    beforeEach(async () => {
        await model.sequelize.sync({
            force: true
        });
    });

    describe('static method', () => {
        describe('createUser', () => {
            it('should create a user and encrypt the password', async () => {
                const createdUser = await model.User.createUser('user1', 'password1');

                createdUser.name.should.equal('user1');
                createdUser.password.should.not.equal('user1');
            });
        });
    });

    describe('instance method', () => {
        let user;

        beforeEach(async () => {
            user = await model.User.createUser('user1', 'password1');
        });

        describe('verifyPassword', () => {
            it('should fulfill true if correct password', async () => {
                await user.verifyPassword('password1').should.be.fulfilledWith(true);
            });

            it('should fulfill false if wrong password', async () => {
                await user.verifyPassword('wrong password').should.be.fulfilledWith(false);
            });
        });

        describe('setPassword', () => {
            it('should set an encrypted password', async () => {
                await user.setPassword('new password');
                await user.verifyPassword('new password').should.be.fulfilledWith(true);
            });

            it('should not save the model', async () => {
                await user.setPassword('new password');
                const refreshedUser = await model.User.findByPk(user.id);
                await refreshedUser.verifyPassword('new password').should.be.fulfilledWith(false);
            });
        });
    });
});
