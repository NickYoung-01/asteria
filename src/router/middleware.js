'use strict';

const RouterError = require('./error');

module.exports.routeNotFound = async (req, res) => {
    throw new RouterError(RouterError.Code.NOT_FOUND);
};
