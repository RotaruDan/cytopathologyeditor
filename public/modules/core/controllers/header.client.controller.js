'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$location', 'Authentication',
    'Menus', '$timeout', '$mdSidenav', '$mdUtil', '$log', 'Courses', 'Challenges',
    function ($rootScope, $scope, $location, Authentication, Menus, $timeout, $mdSidenav, $mdUtil, $log, Courses, Challenges) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.value = 'Cytopathology Challenge';

        var setupChallenge = function(challengeId, callback) {
            Challenges.query({id: challengeId}).
                $promise.then(function (res) {
                    $scope.challenge = res;
                    if(callback) {
                        callback();
                    }
                }, function (error) {
                    console.error('Error retrieving challenge', error);
                }
            );
        };

        var setupCourse = function(courseId, callback) {
            Courses.query({id: courseId}).
                $promise.then(function (res) {
                    $scope.course = res;
                    if(callback) {
                        callback();
                    }
                }, function (error) {
                    console.error('Error retrieving course', error);
                }
            );
        };

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (!toParams) {
                $scope.challenge = null;
                $scope.course = null;
                return;
            }
            if (toParams.courseId) {
                $scope.challenge = null;
                setupCourse(toParams.courseId);
            } else if (toParams.challengeId) {
                setupChallenge(toParams.challengeId, function() {
                    setupCourse($scope.challenge._course);
                });
            } else {
                $scope.challenge = null;
                $scope.course = null;
            }
        });

        $scope.goCourse = function () {
            $location.path('/challenges/' + $scope.course._id);
        };

        $scope.goChallenge = function () {
            var challenge = $scope.challenge;
            $location.path('/challenges/edit/' + challenge._id + '/' + challenge.type);
        };

        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });

        $scope.go = function (path) {
            $location.path(path);
        };
        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildToggler(navID) {
            var debounceFn = $mdUtil.debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug('toggle ' + navID + ' is done');
                    });
            }, 300);
            return debounceFn;
        }

        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');
    }
])
    .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('left').close()
                .then(function () {
                    $log.debug('close LEFT is done');
                });
        };
    })
    .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('right').close()
                .then(function () {
                    $log.debug('close RIGHT is done');
                });
        };
    });
