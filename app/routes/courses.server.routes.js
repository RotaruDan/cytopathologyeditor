'use strict';

module.exports = function (app) {

    var courses = require('../../app/controllers/courses.server.controller');
    var auth = require('../../app/controllers/users/users.authorization.server.controller');

    app.route('/courses')
        .get(auth.requiresLogin, courses.list);

    app.route('/courses')
        .post(auth.requiresLogin, courses.create);

    app.route('/courses/:courseId')
        .get(auth.requiresLogin, courses.courseById)
        .put(auth.requiresLogin, courses.update)
        .delete(auth.requiresLogin, courses.delete);


    app.route('/courses/:courseId/challenges')
        .get(auth.requiresLogin, courses.listChallenges);

};
