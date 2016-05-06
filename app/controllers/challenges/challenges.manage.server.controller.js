'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Challenge = mongoose.model('Challenge');

/**
 * Challenge middleware
 */
exports.challengeByID = function(req, res, next, id) {
    Challenge.findOne({
        _id: id
    }).exec(function(err, challenge) {
        if (err) return next(err);
        if (!challenge) return next(new Error('Failed to load Challenge ' + id));
        req.challenge = challenge;
        next();
    });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
    Challenge.find().sort('-created').exec(function (err, challenges) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(challenges);
        }
    });
};

/**
 * Read a single challenge.
 */
exports.read = function(req, res) {
    // Expects an array, not an object - so...
    var challenges = [];
    challenges.push(req.challenge);
    res.jsonp(challenges);
};

/**
 * Create
 */
exports.create = function (req, res) {

    // Init Variables
    var challenge = new Challenge(req.body);

    // Then save the user
    challenge.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.send({message: 'Challenge Created.'});
        }
    });
};

/**
 * Edit Challenge, by updating the challenge entry.
 */
exports.update = function (req, res, next) {
    var newChallenge = req.body; //note: req.user is the person who is signed in! body is the value that was passed.

    console.log('update', newChallenge);

    Challenge.findOne({
        _id: newChallenge._id
    }, function (err, challenge) {
        if (!err && challenge) {
            challenge.challengeFile = newChallenge.challengeFile;
            challenge.name = newChallenge.name;
            challenge.updated = Date.now();

            challenge.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.send({message: 'Challenge Updated.'});
                }
            });
        }
    });
};


/**
 * Delete User account.
 */
exports.delete = function (req, res) {
    var challengeToDelete = req.challenge; //challenge is the value that was passed.

    challengeToDelete.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.send({message: 'Challenge Deleted.'});
        }
    });
};
