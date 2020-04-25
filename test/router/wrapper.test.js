'use strict';

require('should');
const sinon = require('sinon');
const routerWrapper = require('../../src/router/wrapper');

describe('Tests for router wrapper', () => {
    let req;
    let res;
    let next;
    let param;

    function runP(wrap, routeParamOrParserOrMiddleware) {
        return new Promise((resolve, reject) => {
            next = sinon.spy(resolve);
            wrap(routeParamOrParserOrMiddleware)(req, res, next, param);
        });
    }

    beforeEach(() => {
        req = {};
        res = {};
        param = {};
    });

    describe('wrapRoute', () => {
        it('should call the route if success', () => {
            const route = sinon.spy();
            next = sinon.spy();

            routerWrapper.wrapRoute(route)(req, res, next);
            route.calledWithExactly(req, res).should.be.true();
            next.called.should.be.false();
        });

        it('should call next with rejection', async () => {
            const error = new Error('Error');
            const route = sinon.spy(async () => {
                throw error;
            });

            await runP(routerWrapper.wrapRoute, route);

            route.calledWithExactly(req, res).should.be.true();
            next.calledWithExactly(error).should.be.true();
        });
    });

    describe('wrapParam', () => {
        it('should call next if paramToWrap success', async () => {
            const paramToWrap = sinon.spy();

            await runP(routerWrapper.wrapParam, paramToWrap);

            paramToWrap.calledWithExactly(req, param).should.be.true();
            next.calledWithExactly().should.be.true();
        });

        it('should call next with not arguments if paramToWrap fulfilled with a value', async () => {
            const paramToWrap = sinon.spy(async () => 'something');

            await runP(routerWrapper.wrapParam, paramToWrap);

            paramToWrap.calledWithExactly(req, param).should.be.true();
            next.calledWithExactly().should.be.true();
        });

        it('should call next with rejection', async () => {
            const error = new Error('Error');
            const paramToWrap = sinon.spy(async () => {
                throw error;
            });

            await runP(routerWrapper.wrapParam, paramToWrap);

            paramToWrap.calledWithExactly(req, param).should.be.true();
            next.calledWithExactly(error).should.be.true();
        });
    });

    describe('wrap', () => {
        it('should call next if middleware resolved', async () => {
            const middleware = sinon.spy(async (req, res) => undefined);

            await runP(routerWrapper.wrap, middleware);

            middleware.calledWith(req, res).should.be.true();
            next.calledWithExactly().should.be.true();
            next.callCount.should.equal(1);
        });

        it('should call next with no param if middleware resolved with result', async () => {
            const middleware = sinon.spy(async (req, res) => 'some results');

            await runP(routerWrapper.wrap, middleware);

            middleware.calledWith(req, res).should.be.true();
            next.calledWithExactly().should.be.true();
            next.callCount.should.equal(1);
        });

        it('should call next with `route` only if middleware resolved with `route`', async () => {
            const middleware = sinon.spy(async (req, res) => 'route');

            await runP(routerWrapper.wrap, middleware);

            middleware.calledWith(req, res).should.be.true();
            next.calledWithExactly('route').should.be.true();
            next.callCount.should.equal(1);
        });

        it('should call next if middleware returns undefined', async () => {
            const middleware = sinon.spy(async (req, res) => undefined);

            await runP(routerWrapper.wrap, middleware);

            middleware.calledWith(req, res).should.be.true();
            next.calledWithExactly().should.be.true();
            next.callCount.should.equal(1);
        });

        it('should be compatible with standard middleware calling next with param', async () => {
            const middleware = sinon.spy((req, res, next) => {
                next('route');
            });

            await runP(routerWrapper.wrap, middleware);

            middleware.calledWith(req, res).should.be.true();
            next.calledWithExactly('route').should.be.true();
            next.callCount.should.equal(1);
        });

        it('should be compatible with an async standard middleware calling next with param', async () => {
            const middleware = sinon.spy((req, res, next) => {
                setTimeout(() => {
                    next('route');
                }, 100);
            });

            await runP(routerWrapper.wrap, middleware);

            middleware.calledWith(req, res).should.be.true();
            next.calledWithExactly('route').should.be.true();
            next.callCount.should.equal(1);
        });

        it('should call next with rejection', async () => {
            const error = new Error('Error');
            const middleware = sinon.spy(async (req, res) => {
                throw error;
            });

            await runP(routerWrapper.wrap, middleware);

            middleware.calledWith(req, res).should.be.true();
            next.calledWithExactly(error).should.be.true();
            next.callCount.should.equal(1);
        });
    });
});
