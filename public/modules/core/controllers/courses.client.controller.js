'use strict';


angular.module('core').controller('CoursesController', ['$scope', 'Courses', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Courses, $location, $mdDialog, QueryParams, $http, sharedProperties) {
        // ChallengesController controller logic
        // ...

        function showDialog($event) {
            var parentEl = angular.element(document.body);

            function DialogController($scope, $mdDialog, course) {
                $scope.course = course;

                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.addCourse = function () {
                    console.log(JSON.stringify($scope.course, null, '  '));
                    $scope.course.$save(function (err) {
                        $scope.closeDialog();
                        updateCourses();
                    });
                };
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                template: '<md-dialog aria-label="Course dialog">' +
                '  <md-dialog-content>' +
                '    <md-input-container>' +
                '       <label>Course name</label>' +
                '       <input type="text" ng-model="course.name">' +
                '   </md-input-container>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <md-button ng-click="closeDialog()" class="md-primary">' +
                '      Close Dialog' +
                '    </md-button>' +
                '    <md-button ng-click="addCourse()" class="md-primary">' +
                '     Add Course' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                locals: {
                    course: $scope.course,
                },
                controller: DialogController
            });
        }

        $scope.showDialog = showDialog;


        function updateCourses() {
            $scope.courses = Courses.get(function () {
                console.log($scope.courses);
            });
        }

        updateCourses();

        $scope.course = new Courses();
        $scope.go = function (course) {
            sharedProperties.setChallenge(course);
            $location.path('/challenges/' + course._id);
        };
    }
]);
