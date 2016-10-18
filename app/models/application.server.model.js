'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
    name: {
        type: String,
        required: 'Please add an apk file!'
    },
    apkFile: {
        type: String,
        trim: true,
        required: 'Please add an apk file!'
    },
    htmlFile: {
        type: String,
        trim: true,
        required: 'Please add an html file!'
    },
    updated: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['FAIL', 'SUCCESS', 'BUILDING'],
        default: 'BUILDING'
    }
});

mongoose.model('Application', ApplicationSchema);
