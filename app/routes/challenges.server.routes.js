'use strict';

module.exports = function (app) {

    // Challenges Routes
    var challenges = require('../../app/controllers/challenges.server.controller');
    var auth = require('../../app/controllers/users/users.authorization.server.controller');

    /** API path that will upload the files */
    app.post('/upload/:challengeId', auth.requiresLogin, challenges.uploadImage);

    /** API path that will upload the files */
    app.post('/uploads/:challengeId', auth.requiresLogin, challenges.uploadImages);

    app.post('/hints/:challengeId', auth.requiresLogin, challenges.uploadHintImages);

    // Uploads a thumbnail.jpg image
    app.post('/thumbnail/:challengeId', auth.requiresLogin, challenges.uploadThumbnailImage);

    //List challenges
    app.route('/challenges')
        .get(auth.requiresLogin, challenges.list);

    //manage challenges -> new challenges
    app.route('/challenges')
        .post(auth.requiresLogin, challenges.create);

    //manage users -> edit account
    app.route('/challenges/:challengeId')
        .get(auth.requiresLogin, challenges.challengeById)
        .put(auth.requiresLogin, challenges.update)
        .delete(auth.requiresLogin, challenges.delete);

    app.route('/api/challenges')
        .get(auth.requiresLogin, challenges.list);

};
