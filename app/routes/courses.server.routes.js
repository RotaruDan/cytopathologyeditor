'use strict';

module.exports = function (app) {

    var courses = require('../../app/controllers/courses.server.controller');

    app.route('/courses')
        .get(courses.list);

    app.route('/courses')
        .post(courses.create);

    app.route('/courses/:courseId')
        .get(courses.courseById)
        .put(courses.update)
        .delete(courses.delete);


    app.route('/courses/:courseId/challenges')
        .get(courses.listChallenges);

};
