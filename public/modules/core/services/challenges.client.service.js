'use strict';

angular.module('core')
    .service('sharedProperties', function () {
        var currentChallenge = {};

        return {
            getChallenge: function () {
                return currentChallenge;
            },
            setChallenge: function (value) {
                currentChallenge = value;
            },
            getCourse: function () {
                return currentChallenge;
            },
            setCourse: function (value) {
                currentChallenge = value;
            }
        };
    })
    .service('thumbnails', ['$http', function ($http) {

        var uploadThumbnail = function (thumbnail, challengeId, callback) {

            var formData = new FormData();
            formData.append('files', thumbnail);

            // Upload the selected Photo
            $http.post('/thumbnail/' + challengeId, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function (res) {
                callback();
            }).error(function (err) {
                console.log('Thumbnail upload error!', err);
                callback(err);
            });
        };

        return {
            uploadThumbnail: function (canvas, challengeId, callback) {
                // Get thumbnail file
                if (canvas.msToBlob) {
                    // Internet Explorer error correction
                    var thumbnail = canvas.msToBlob();
                    return uploadThumbnail(thumbnail, challengeId, callback);
                } else if (canvas.toBlob) {
                    canvas.toBlob(function (thumbnail) {
                        uploadThumbnail(thumbnail, challengeId, callback);
                    });
                } else {
                    callback(new Error('Cannot retrieve thumbnail, ' +
                        'probably the browser doesn\'t support it.'));
                }
            }
        };
    }]).factory('Challenges', ['$resource',
        function ($resource) {
            return $resource('/challenges/:id', {
                id: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {method: 'GET', isArray: false},

                get: {method: 'GET', isArray: true},

                delete: {method: 'DELETE'}
            });
        }
    ]).factory('Courses', ['$resource',
        function ($resource) {
            return $resource('/courses/:id', {
                id: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {method: 'GET', isArray: false},

                get: {method: 'GET', isArray: true}
            });
        }
    ]).factory('QueryParams', [
        function () {

            return {
                getChallengeId: function () {
                    var result = window.location.hash.substr(19, 24);

                    return result;
                },
                getCourseId: function () {
                    var result = window.location.hash.substr(14, 24);

                    return result;
                }
            };
        }
    ]);
