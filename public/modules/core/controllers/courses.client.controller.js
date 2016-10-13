'use strict';


angular.module('core').controller('CoursesController', ['$rootScope', '$scope', 'Courses', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($rootScope, $scope, Courses, $location, $mdDialog, QueryParams, $http, sharedProperties) {
        // ChallengesController controller logic
        // ...

        var go = function (course) {
            sharedProperties.setCourse(course);
            $rootScope.course = course;
            $location.path('/challenges/' + course._id);
        };

        function showDialog($event) {
            var parentEl = angular.element(document.body);

            function DialogController($scope, $mdDialog, course) {
                $scope.course = course;

                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.addCourse = function () {
                    $scope.course.$save(function (err) {
                        $scope.closeDialog();
                        go($scope.course);
                    });
                };
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'modules/core/views/course.add.dialog.html',

                locals: {
                    course: $scope.course,
                },
                controller: DialogController
            });
        }

        $scope.showDialog = showDialog;


        $scope.remove = function (course, event) {
            event.stopPropagation();

            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Course ' + course.name)
                .content('Would you like to delete the course and all its challenges?')
                .ariaLabel('Course removal')
                .ok('Accept')
                .cancel('Cancel')
                .targetEvent(event);
            $mdDialog.show(confirm).then(function () {
                // Remove the challenge
                Courses.delete({id:course._id}, function () {
                    updateCourses();
                });
            }, function () {
                // Cancelled
            });
        };

        function updateCourses() {
            $scope.courses = Courses.get(function () {
            });
        }

        updateCourses();

        $scope.course = new Courses();
        $scope.course.difficulty = 'EASY';
        $scope.go = go;
    }
]);
