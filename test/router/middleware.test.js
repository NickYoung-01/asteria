'use strict';

require('should');
const middleware = require('../../src/router/middleware');
const RouterError = require('../../src/router/error');

describe('Tests for router middleware', () => {
    let req;
    let res;

    describe('routeNotFound', () => {
        it('should reject a NOT_FOUND error', async () => {
            await middleware.routeNotFound(req, res).should.be.rejectedWith(RouterError.Code.NOT_FOUND.name);
        });
    });
});
