'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
    Challenge = mongoose.model('Challenge');

var archiver = require('archiver');
var async = require('async');
var fs = require('fs');
var Readable = require('stream').Readable;
var multer = require('multer');
var mkdirp = require('mkdirp');

// Base path where the challenge files will be uploaded
var uploadsPath = './public/uploads/';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var pathDir = uploadsPath + req.params.challengeId + '/';
        mkdirp(pathDir, function (err) {
            if (!err) {
                cb(null, pathDir);
            } else {
                //debug
                console.log(err);
                cb(err);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var multerMiddleware = multer({ //multer settings
    storage: storage
});
var upload = multerMiddleware.single('files');
var uploadFiles = multerMiddleware.array('files[]', 4);

var hintsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var pathDir = uploadsPath + req.params.challengeId + '/hints/';
        mkdirp(pathDir, function (err) {
            if (!err) {
                cb(null, pathDir);
            } else {
                //debug
                console.log(err);
                cb(err);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});


var multerHintsMiddleware = multer({ //multer hints settings
    storage: hintsStorage
});
var uploadHintFiles = multerHintsMiddleware.array('files[]');


/**
 * Removes a folder recursively
 * @param location
 * @param next
 */
function removeFolder(location, next) {
    fs.readdir(location, function (err, files) {
        async.each(files, function (file, cb) {
            file = location + '/' + file;
            fs.stat(file, function (err, stat) {
                if (err) {
                    return cb(err);
                }
                if (!stat.isDirectory()) {
                    fs.unlink(file, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb();
                    });
                } else {
                    cb();
                }
            });
        }, function (err) {
            if (err) {
                return next(err);
            }
            return next();
        });
    });
}


function challengeHasHintImage(challenge, image) {
    var hint = challenge.challengeFile.hint;
    if (hint) {
        var infos = hint.infos;
        if (infos) {
            infos.forEach(function (info) {
                if (info.imagePath &&
                    info.imagePath.indexOf(image) !== -1) {
                    return true;
                }
            });
        }
    }
    return true;
}

/**
 * Removes the unused hint images from the /hints folder
 * @param location
 * @param next
 */
function removeUnusedHintImages(challenge, next) {
    var pathDir = uploadsPath + challenge._id + '/hints/';
    fs.readdir(pathDir, function (err, files) {
        async.each(files, function (file, cb) {
            if (challengeHasHintImage(challenge, file)) {
                return cb();
            }
            file = pathDir + file;
            fs.stat(file, function (err, stat) {
                if (err) {
                    return cb(err);
                }
                if (!stat.isDirectory()) {
                    fs.unlink(file, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb();
                    });
                } else {
                    cb();
                }
            });
        }, function (err) {
            if (err) {
                return next(err);
            }
            return next();
        });
    });
}

exports.uploadImage = function (req, res) {
    var pathDir = uploadsPath + req.params.challengeId + '/';

    removeFolder(pathDir, function (error) {
        if (error) {
            console.error(error);
        }
        upload(req, res, function (err) {
            if (err) {
                res.status(400).json({error_code: 1, err_desc: err});
                return;
            }
            res.json({error_code: 0, err_desc: null});
        });
    });
};

exports.uploadImages = function (req, res) {
    var pathDir = uploadsPath + req.params.challengeId + '/';

    removeFolder(pathDir, function (error) {
        if (error) {
            console.error(error);
        }
        uploadFiles(req, res, function (err) {
            if (err) {
                res.status(400).json({error_code: 1, err_desc: err});
                return;
            }
            res.json({error_code: 100, err_desc: null});
        });
    });
};

exports.uploadHintImages = function (req, res) {
    uploadHintFiles(req, res, function (err) {
        if (err) {
            res.status(400).json({error_code: 1, err_desc: err});
            return;
        }
        res.json({error_code: 100, err_desc: null});
    });
};

/**
 *
 * @param str
 * @param suffix
 * @returns {boolean} - true if the given string ends with the provided suffix.
 */
var endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Challenge middleware
 */
exports.challengeById = function (req, res) {
    Challenge.findOne({
        _id: req.params.challengeId
    }).exec(function (err, challenge) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            if (!challenge) return res.status(404).json('No challenge found');

            res.json(challenge);
        }
    });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
    Challenge.find().sort('-created').exec(function (err, challenges) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(challenges);
        }
    });
};

/**
 * Create
 */
exports.create = function (req, res) {

    // Init Variables
    var challenge = new Challenge(req.body);

    // Then save the user
    challenge.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var location = uploadsPath + challenge._id + '/';
            mkdirp(location, function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                var zipPath = location + 'challenge.zip';

                // Create .zip package
                var archive = archiver('zip');

                var output = fs.createWriteStream(zipPath);

                output.on('close', function () {
                    console.log(archive.pointer() + ' total bytes');
                    console.log('archiver has been finalized ' +
                        'and the output file descriptor has closed.');
                });

                archive.on('error', function (err) {
                    throw err;
                });

                archive.pipe(output);

                // Add file directly
                var s = new Readable();
                s.push(JSON.stringify(challenge.challengeFile, null, '    '));    // the string you want
                s.push(null);
                archive.append(s, {name: 'challenge.json'});

                archive.finalize();

                res.send({message: 'Challenge Created.'});
            });
        }
    });
};

var addImagesToZip = function (location, archiver, next) {
    fs.readdir(location, function (err, files) {
        async.each(files, function (file, cb) {
            var fileName = file;
            file = location + '/' + file;
            fs.stat(file, function (err, stat) {
                if (!err) {
                    // Only include in the .zip the
                    // files that are jpg, jpeg or png
                    if (stat.isFile() &&
                        (endsWith(fileName, '.jpg') ||
                        endsWith(fileName, '.jpeg') ||
                        endsWith(fileName, '.png'))) {
                        fs.readFile(file, function (err, data) {
                            if (!err) {
                                archiver.append(data, {name: fileName});
                            }
                            cb();
                        });
                    } else if (stat.isDirectory()) {
                        archiver.directory(file, fileName, {
                            name: fileName
                        });

                        cb();
                    } else {
                        cb();
                    }
                } else {
                    cb();
                }
            });
        }, function (err) {
            if (err) {
                return next(err);
            }
            // Zip the files
            next();
        });
    });
};

/**
 * Edit Challenge, by updating the challenge entry.
 */
exports.update = function (req, res, next) {
    var newChallenge = req.body; //note: req.user is the person who is signed in! body is the value that was passed.

    console.log('update', newChallenge);

    Challenge.findOne({
        _id: req.params.challengeId
    }, function (err, challenge) {
        if (!err && challenge) {
            challenge.challengeFile = newChallenge.challengeFile;
            challenge.name = newChallenge.name;
            challenge.updated = Date.now();

            challenge.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    var location = uploadsPath + newChallenge._id + '/';

                    removeUnusedHintImages(challenge, function (err) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        }
                        mkdirp(location, function (err) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                            var zipPath = location + 'challenge.zip';

                            // Create .zip package
                            var archive = archiver('zip');

                            var output = fs.createWriteStream(zipPath);

                            output.on('close', function () {
                                console.log(archive.pointer() + ' total bytes');
                                console.log('archiver has been finalized ' +
                                    'and the output file descriptor has closed.');
                            });

                            archive.on('error', function (err) {
                                throw err;
                            });

                            archive.pipe(output);

                            // Add file directly
                            var s = new Readable();
                            s.push(JSON.stringify(newChallenge.challengeFile, null, '    '));    // the string you want
                            s.push(null);
                            archive.append(s, {name: 'challenge.json'});

                            addImagesToZip(location, archive, function (err) {
                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                }

                                // Write everything to disk
                                archive.finalize();
                                res.send({
                                    message: 'Challenge updated.'
                                });
                            });
                        });
                    });
                }
            });
        }
    });
};


/**
 * Delete User account.
 */
exports.delete = function (req, res) {
    var challengeToDelete = req.challenge; //challenge is the value that was passed.

    challengeToDelete.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var location = uploadsPath + challengeToDelete._id + '/';
            removeFolder(location, function (err) {
                res.send({message: 'Challenge Deleted.'});
            });
        }
    });
};
