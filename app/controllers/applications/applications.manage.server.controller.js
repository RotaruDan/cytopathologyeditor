'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Application = mongoose.model('Application'),
    shelljs = require('shelljs');
var uploadsPath = './public/applications/';

/**
 * Application middleware
 */
exports.applicationById = function (req, res) {
    var id = req.params.appId;
    Application.findOne({
        _id: id
    }).exec(function (err, app) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        if (!app) {
            return res.status(404).json('No Application found');
        }

        res.json(app);
    });
};

/**
 * List of Applications
 */
exports.list = function (req, res) {
    Application.find().sort('-created').exec(function (err, apps) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        res.json(apps);
    });
};

/**
 * Create an Application
 */
exports.create = function (req, res) {

    // Init Variables
    var app = new Application(req.body);

    // Then save the app
    app.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        var command = 'bash cytopathology-application-deploy.sh ' + test + id + ' ' + uploadsPath + id;
        console.log('Shell executing command', command);
        shelljs.exec(command,
            function (code, stdout, stderr) {
                if (code !== 0) {
                    app.status = 'FAILED';
                    app.save(function (err) {

                    });
                    return;
                }
                app.status = 'SUCCESS';
                app.save(function (err) {

                });
            });

        res.json(app);
    });
};

/**
 * Remove an Application
 */
exports.update = function (req, res) {
    var newApp = req.body;

    Application.findOne({
        _id: req.params.appId
    }, function (err, app) {
        if (!err && app) {
            app.name = newApp.name;

            app.updated = Date.now();

            app.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                res.send({
                    message: 'Application updated.'
                });
            });
        }
    });
};

/**
 * Delete Application.
 */
exports.delete = function (req, res) {

    var id = req.params.appId;
    Application.remove({
        _id: id
    }, function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        // TODO delete the folders

        res.send({
            message: 'Application deleted.'
        });
    });
};
