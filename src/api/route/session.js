'use strict';

const q = require('q');
const domain = require('../../domain');
const ApiError = require('../error');

module.exports.get = async (req, res) => {
    res.json({
        id: req.sessionID,
        user: req.currentUser.expose()
    });
};

module.exports.create = async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    try {
        const user = await domain.User.getByName(name);
        await user.authenticate(password);
        await q.ninvoke(req.session, 'regenerate');
        req.session.userId = user.id;

        res.json({
            id: req.sessionID,
            user: user.expose()
        });
    }
    catch (e) {
        if (e.name === domain.Error.errorName) {
            throw new ApiError(ApiError.Code.AUTHENTICATION_FAILED);
        }
        else {
            throw e;
        }
    }
};

module.exports.delete = async (req, res) => {
    const sessionId = req.params.sessionId;

    if (sessionId === req.sessionID) {
        req.session.destroy();
        res.json({});
        return q();
    }
    else {
        throw new ApiError(ApiError.Code.SESSION_NOT_FOUND);
    }
};
