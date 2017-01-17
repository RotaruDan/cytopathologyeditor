'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validateTime = function (time) {
    return time === 0 || time === 10000 || time === 20000 || time === 40000;
};

/**
 * Course Schema
 */
var CourseSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please add a challenge name!'
    },
    timePerChallenge: {
        type: Number,
        default: -1,
        validate: [validateTime, 'Invalid time per challenge value, allowed values: 0, 10000, 20000, 40000']
    },
    updated: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },
    difficulty: {
        type: String,
        enum: ['EASY', 'MEDIUM', 'HARD'],
        required: 'Please add a course difficulty!'
    }
});

mongoose.model('Course', CourseSchema);
