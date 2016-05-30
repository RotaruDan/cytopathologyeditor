'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
            state('home', {
                toolbarName: 'Cytopathology Challenge',
                url: '/',
                templateUrl: 'modules/core/views/home.client.view.html'
            }).
            state('courses', {
                toolbarName: 'Courses',
                url: '/courses',
                templateUrl: 'modules/core/views/courses.client.view.html'
            }).
            state('challenges', {
                toolbarName: 'Challenges',
                url: '/challenges/:courseId',
                templateUrl: 'modules/core/views/challenges.client.view.html'
            }).
            state('editmcq', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/mcq',
                templateUrl: 'modules/core/views/edit-mcq.client.view.html'
            }).
            state('editdnd', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/dnd',
                templateUrl: 'modules/core/views/edit-dnd.client.view.html'
            }).
            state('editmicq', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/micq',
                templateUrl: 'modules/core/views/edit-micq.client.view.html'
            }).
            state('editftb', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/ftb',
                templateUrl: 'modules/core/views/edit-ftb.client.view.html'
            }).
            state('editpolygon', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/polygon',
                templateUrl: 'modules/core/views/edit-polygon.client.view.html'
            }).
            state('preview', {
                toolbarName: 'Challenge',
                url: '/challenges/preview/:challengeId',
                templateUrl: 'preview/index.html'
            });
    }
]);
