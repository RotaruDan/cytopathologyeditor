'use strict';

module.exports = function (app) {

    var auth = require('../controllers/users/users.authorization.server.controller');
    var applications = require('../controllers/applications.server.controller');

    app.route('/applications')
        .get(auth.requiresLogin, applications.list)
        .post(auth.requiresLogin, applications.create);

    app.route('/applications/:appId')
        .get(auth.requiresLogin, applications.applicationById)
        .put(auth.requiresLogin, applications.update)
        .delete(auth.requiresLogin, applications.delete);
};
