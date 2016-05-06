'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Challenge = mongoose.model('Challenge');

/**
 * Globals
 */
var challenge, challenge2;

/**
 * Unit tests
 */
describe('Challenge Model Unit Tests:', function () {
    before(function (done) {
        challenge = new Challenge({
            challengeFile: 'some path',
            name: 'Name',
            type: 'mcq'
        });
        challenge2 = new Challenge({
            challengeFile: 'some second path',
            name: 'Name2',
            type: 'mcq'
        });

        done();
    });

    describe('Method Save', function () {
        it('should begin with no challenges', function (done) {
            Challenge.find({}, function (err, challenges) {
                challenges.should.have.length(0);
                done();
            });
        });

        it('should be able to save without problems', function (done) {
            challenge.save(done);
        });

        it('should be able to show an error when try to save without name', function (done) {
            challenge.name = null;
            return challenge.save(function (err) {
                should.exist(err);
                done();
            });
        });
    });

    after(function (done) {
        Challenge.remove().exec();
        done();
    });
});
