'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    challenges = require('../challenges.server.controller'),
    Course = mongoose.model('Course'),
    Challenge = mongoose.model('Challenge'),
    async = require('async');

/**
 * Course middleware
 */
exports.courseById = function (req, res) {
    Course.findOne({
        _id: req.params.courseId
    }).exec(function (err, course) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            if (!course) {
                return res.status(404).json('No course found');
            }

            res.json(course);
        }
    });
};

/**
 * List of Courses
 */
exports.list = function (req, res) {
    Course.find().sort('-created').exec(function (err, courses) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        res.json(courses);

    });
};

/**
 * List of challenges of a course
 */
exports.listChallenges = function (req, res) {
    Challenge.find({
        '_course': req.params.courseId
    }, function (err, challenges) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        res.json(challenges);
    });
};

/**
 * Create
 */
exports.create = function (req, res) {

    // Init Variables
    var course = new Course(req.body);

    // Then save the user
    course.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        res.json(course);

    });
};

/**
 * Edit Course, by updating the course name.
 */
exports.update = function (req, res, next) {
    var newCourse = req.body;

    Course.findOne({
        _id: req.params.courseId
    }, function (err, course) {
        if (!err && course) {
            course.name = newCourse.name;

            course._challenges = newCourse._challenges;

            course.updated = Date.now();

            course.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                res.send({
                    message: 'Course updated.'
                });

            });
        }
    });
};

/**
 * Delete Course.
 */
exports.delete = function (req, res) {

    var id = req.params.courseId;
    Course.remove({
        _id: id
    }, function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        Challenge.find({
            '_course': id
        }, function (err, challengesArray) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            async.each(challengesArray, function (challenge, callback) {
                challenges.removeChallengeFiles(challenge._id, callback);
            }, function (err) {
                res.send({
                    message: 'Course deleted.'
                });
            });
        });
    });
};
