'use strict';

require('should');
const sinon = require('sinon');
const ApiError = require('../../../src/api/error');
const domain = require('../../../src/domain');
const route = require('../../../src/api/route');

describe('Tests for api route session', () => {
    let req;
    let res;
    let user;
    let session;

    beforeEach(() => {
        req = {};
        res = {
            json: sinon.spy(),
        };

        session = {
            regenerate: sinon.stub(),
            destroy: sinon.stub().resolves(),
        };

        user = {
            id: 1,
            expose: sinon.stub().returns('exposedUser'),
            authenticate: sinon.stub().resolves(),
        };
    });

    describe('get', () => {
        it('should json the session id and the exposed user', () => {
            req.currentUser = user;
            req.sessionID = 'qPbv74LGpgcOIZ_JsneaIIXGQAy0TRRe';

            route.session.get(req, res);

            res.json.calledWithExactly({
                id: 'qPbv74LGpgcOIZ_JsneaIIXGQAy0TRRe',
                user: 'exposedUser'
            }).should.be.true();
        });
    });

    describe('create', () => {
        beforeEach(() => {
            sinon.stub(domain.User, 'getByName');
            req.session = session;
            req.sessionID = 'qPbv74LGpgcOIZ_JsneaIIXGQAy0TRRe';

            req.body = {
                name: 'user1',
                password: 'password1',
            };
        });

        afterEach(() => {
            domain.User.getByName.restore();
        });

        it('should get the user by its name, authenticate it, regenerate the session then json the session id and the exposed user', async () => {
            domain.User.getByName.resolves(user);
            req.session.regenerate.yields();

            await route.session.create(req, res);

            domain.User.getByName.calledWithExactly('user1').should.be.true();
            user.authenticate.calledWithExactly('password1').should.be.true();

            req.session.regenerate.called.should.be.true();

            req.session.userId.should.equal(1);

            res.json.calledWithExactly({
                id: 'qPbv74LGpgcOIZ_JsneaIIXGQAy0TRRe',
                user: 'exposedUser'
            }).should.be.true();
        });

        it('should reject AUTHENTICATION_FAILED if domain Error', async () => {
            domain.User.getByName.throws(new domain.Error(domain.Error.Code.USER_NOT_FOUND));

            await route.session.create(req, res).should.be.rejectedWith(ApiError.Code.AUTHENTICATION_FAILED.name);
        });

        it('should reject other errors', async () => {
            domain.User.getByName.resolves(user);
            req.session.regenerate.yields(new Error('error'));

            await route.session.create(req, res).should.be.rejectedWith('error');
        });
    });

    describe('delete', () => {
        beforeEach(() => {
            req.session = session;
            req.sessionID = 'qPbv74LGpgcOIZ_JsneaIIXGQAy0TRRe';
        });

        it('should destroy the session if correct ids', async () => {
            req.params = {
                sessionId: 'qPbv74LGpgcOIZ_JsneaIIXGQAy0TRRe',
            };

            await route.session.delete(req, res);

            req.session.destroy.calledWithExactly().should.be.true();
            res.json.calledWithExactly({}).should.be.true();
        });

        it('should reject SESSION_NOT_FOUND if incorrect ids', async () => {
            req.params = {
                sessionId: 'wrong id',
            };

            await route.session.delete(req, res).should.be.rejectedWith(ApiError.Code.SESSION_NOT_FOUND.name);
        });
    });
});
