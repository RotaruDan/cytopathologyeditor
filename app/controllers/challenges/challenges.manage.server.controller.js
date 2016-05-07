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
exports.challengeById = function(req, res) {
    Challenge.findOne({
        _id: req.params.challengeId
    }).exec(function(err, challenge) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            if (!challenge) return res.status(404).json('No challenge found');

            res.json(challenge);
        }
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
        _id: req.params.challengeId
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
