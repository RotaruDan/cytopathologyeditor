'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
            state('home', {
                url: '/',
                templateUrl: 'modules/core/views/home.client.view.html'
            }).
            state('challenges', {
                url: '/challenges',
                templateUrl: 'modules/core/views/challenges.client.view.html'
            }).
            state('editmcq', {
                url: '/challenges/edit/:challengeId/mcq',
                templateUrl: 'modules/core/views/edit-mcq.client.view.html'
            }).
            state('editdnd', {
                url: '/challenges/edit/:challengeId/dnd',
                templateUrl: 'modules/core/views/edit-dnd.client.view.html'
            }).
            state('editmicq', {
                url: '/challenges/edit/:challengeId/micq',
                templateUrl: 'modules/core/views/edit-micq.client.view.html'
            }).
            state('editftb', {
                url: '/challenges/edit/:challengeId/ftb',
                templateUrl: 'modules/core/views/edit-ftb.client.view.html'
            }).
            state('editpolygon', {
                url: '/challenges/edit/:challengeId/polygon',
                templateUrl: 'modules/core/views/edit-polygon.client.view.html'
            });
    }
]);
