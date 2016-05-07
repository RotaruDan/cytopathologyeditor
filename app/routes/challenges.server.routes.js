'use strict';

var fs = require('fs');


module.exports = function (app) {

    var multer = require('multer');

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            var pathDir = './uploads/' + req.params.challengeId + '/';
            fs.mkdir(pathDir, function (e) {
                if (!e || (e && e.code === 'EEXIST')) {
                    cb(null, pathDir);
                } else {
                    //debug
                    console.log(e);
                    cb(e);
                }
            });
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    });
    var upload = multer({ //multer settings
        storage: storage
    }).single('files');

    /** API path that will upload the files */
    app.post('/upload/:challengeId', function (req, res) {
        upload(req, res, function (err) {
            if (err) {
                res.status(400).json({error_code: 1, err_desc: err});
                return;
            }
            res.json({error_code: 0, err_desc: null});
        });

    });


    // Challenges Routes
    var challenges = require('../../app/controllers/challenges.server.controller');

    // Finish by binding the user middleware
    // app.param('challengeId', challenges.challengeByID);

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
