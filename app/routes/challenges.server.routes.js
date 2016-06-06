'use strict';

module.exports = function (app) {

    // Challenges Routes
    var challenges = require('../../app/controllers/challenges.server.controller');

    /** API path that will upload the files */
    app.post('/upload/:challengeId', challenges.uploadImage);

    /** API path that will upload the files */
    app.post('/uploads/:challengeId', challenges.uploadImages);

    app.post('/hints/:challengeId', challenges.uploadHintImages);

    //List challenges
    app.route('/challenges')
        .get(challenges.list);

    //manage challenges -> new challenges
    app.route('/challenges')
        .post(challenges.create);

    //manage users -> edit account
    app.route('/challenges/:challengeId')
        .get(challenges.challengeById)
        .put(challenges.update)
        .delete(challenges.delete);

};
