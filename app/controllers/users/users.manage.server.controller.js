'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
    errorHandler = require('../errors.server.controller'),
	User = mongoose.model('User');

/**
 * User middleware - get the 'profile' that will have its password reset.
 */
exports.profileByID = function(req, res, next) {
    //console.log(req);
	User.findOne({
		_id: req.params.profileId //note: get the stateparams from the url.
	}).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + req.profile._id));
		req.profile = user;
		next();
	});
};

/**
 * Read a single user.
 */
exports.read = function(req, res) {
    // Expects an array, not an object - so...
    var userProfile = [];
    req.profile.password = undefined;
    req.profile.salt = undefined;
    userProfile.push(req.profile);
	res.jsonp(userProfile);
};

/**
 * List of Users
 */
exports.list = function(req, res) {
	User.find().sort('-created').exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
            //remove the users passwords etc.
            for(var i = 0; i < users.length; i++) {
                users[i].password = undefined;
                users[i].salt = undefined;
            }
			res.json(users);
		}
	});
};

/**
 * Create
 */
exports.create = function(req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;
    user.forcePasswordChange = true;

	// Then save the user 
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

            res.send({message: 'Account Created.'});
		}
	});
};

/**
 * Edit User account, by updating the user entry.
 */
exports.update = function(req, res, next) {
    var profile = req.body; //note: req.user is the person who is signed in! profile is the value that was passed.
    console.log(profile);
    
    User.findOne({
        _id: profile._id
    }, function(err, user) {
        if (!err && user) {
            user.firstName = profile.firstName;
            user.lastName = profile.lastName;
            user.email = profile.email;
            user.role = profile.role;
            //user.password = profile.password;
            console.log(user);
            
            user.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								res.send({message: 'Profile Altered.'});
				            }
                        });
        }
    });
};

/**
 * Edit User account, by updating the user entry.
 */
exports.updateAdmin = function(req, res, next) {
    var profile = req.body;
    
    var query = {'_id':profile._id};
    
    User.findOne(query, function(err, user){
        if (err) { return next(err); }
            user = _.extend(user, profile);
		    user.updated = Date.now();
            user.save(function(err) {
                if (err) { return next(err); }
                res.send({message: 'Profile Altered.'});
        });
    });
};

exports.reset = function(req, res, next) {
	// Init Variables
	var passwordDetails = req.body;
    //console.log(req);
    
			User.findOne({
				_id: req.profile._id, //note: req.user is the person who is signed in! profile is the value that was passed.
			}, function(err, user) {
				if (!err && user) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.password = passwordDetails.newPassword;
                        user.forcePasswordChange = true;
                        user.locked = false; //unlock account upon password reset.
                        user.loginAttempts = 0; //reset attempts.
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								res.send({message: 'Password Reset.'});
				            }
                        });
                    } else {
				        return res.status(400).send({
				            message: 'Passwords do not match'
			             });
                    }
                }
            });
};


/**
 * Unlock User account, by updating the user entry.
 */
exports.unlock = function(req, res) {
	var profile = req.profile; //note: req.user is the person who is signed in! profile is the value that was passed.
    //console.log(req);

	profile = _.extend(profile, req.body);

	profile.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//res.send({message: 'Unlocked.'});
            res.json(profile);
		}
	});
};


/**
 * Delete User account.
 */
exports.delete = function(req, res) {
    var profile = req.profile; //note: req.user is the person who is signed in! profile is the value that was passed.
    //console.log(req);
    
    profile.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.send({message: 'Deleted.'});
            //res.json(user);
		}
	});
};