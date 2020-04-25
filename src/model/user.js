'use strict';

const bcrypt = require('bcrypt');
const q = require('q');
const Sequelize = require('sequelize');

module.exports.define = sequelize => {
    const User = sequelize.define('User', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    }, {
        indexes: [
            {
                name: 'Users_name',
                unique: true,
                fields: ['name']
            },
        ],
    });

    User.prototype.verifyPassword = async function(password) {
        return await q.ninvoke(bcrypt, 'compare', password, this.password);
    };

    User.prototype.setPassword = async function(password) {
        const salt = await q.ninvoke(bcrypt, 'genSalt');
        this.password = await q.ninvoke(bcrypt, 'hash', password, salt);
    };

    User.createUser = async function(name, password) {
        const builtUser = this.build({
            name
        });
        await builtUser.setPassword(password);
        return await builtUser.save();
    };

    return User;
};
