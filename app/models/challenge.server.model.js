'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Challenge Schema
 */
var ChallengeSchema = new Schema({
    challengeFile: {
        type: Schema.Types.Mixed,
        required: 'Please add a challenge file!'
    },
    name: {
        type: String,
        trim: true,
        required: 'Please add a challenge name!'
    },
    updated: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['dnd', 'mcq', 'micq', 'ftb', 'polygon'],
        required: 'Please add a challenge type!'
    }
});

mongoose.model('Challenge', ChallengeSchema);
