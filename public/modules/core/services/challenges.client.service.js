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
            }
        };
    }).factory('Challenges', ['$resource',
        function ($resource) {
            return $resource('/challenges', {
                challengeId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ]).factory('QueryParams', [
        function () {

            return {
                getQueryParam: function (param) {
                    var result = window.location.search.match(
                        new RegExp('(\\?|&)' + param + '(\\[\\])?=([^&]*)')
                    );

                    return result ? result[3] : false;
                }
            };
        }
    ]);
