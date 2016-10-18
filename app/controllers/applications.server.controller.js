'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend applications's controller
 */
module.exports = _.extend(
    require('./applications/applications.manage.server.controller')
);
