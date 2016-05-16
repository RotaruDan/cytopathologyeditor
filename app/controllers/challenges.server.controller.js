'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend challenge's controller
 */
module.exports = _.extend(
    require('./challenges/challenges.manage.server.controller')
);
