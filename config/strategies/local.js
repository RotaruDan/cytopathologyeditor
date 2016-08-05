'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    User = require('mongoose').model('User');

module.exports = function () {
    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function (username, password, done) {
            User.findOne({
                username: username
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user or invalid password'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Unknown user or invalid password'
                    });
                }

                return done(null, user);
            });
        }
    ));

    passport.use(new BasicStrategy(
        function (userid, password, done) {
            User.findOne({username: userid}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user or invalid password'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Unknown user or invalid password'
                    });
                }

                return done(null, user);
            });
        }
    ));

};
