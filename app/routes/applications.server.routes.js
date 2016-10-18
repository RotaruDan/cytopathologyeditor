'use strict';

module.exports = function (app) {

    var applications = require('../../app/controllers/application.server.controller');
    var auth = require('../../app/controllers/users/users.authorization.server.controller');

    app.route('/applications')
        .get(auth.requiresLogin, applications.list)
        .post(auth.requiresLogin, applications.create);

    app.route('/applications/:appId')
        .get(auth.requiresLogin, applications.applicationById)
        .put(auth.requiresLogin, applications.update)
        .delete(auth.requiresLogin, applications.delete);
};
