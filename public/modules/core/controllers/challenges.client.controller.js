'use strict';



angular.module('core').controller('ChallengesController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http',
    function ($scope, Challenges, $location, $mdDialog, QueryParams, $http) {
        // ChallengesController controller logic
        // ...
        function showDialog($event) {
            var parentEl = angular.element(document.body);

            function DialogController($scope, $mdDialog, challenge, types, readTypes) {
                $scope.challenge = challenge;
                $scope.types = types;
                $scope.selectedReadType = readTypes[0];
                $scope.readTypes = readTypes;
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.addChallenge = function () {
                    $scope.challenge.challengeFile = 'test.zip';
                    $scope.challenge.$save(function (err) {
                        $scope.closeDialog();
                        updateChallenges();
                    });
                };
                $scope.openMenu = function ($mdOpenMenu, ev) {
                    $mdOpenMenu(ev);
                };
                $scope.chooseType = function (index) {
                    if (!index) {
                        index = 0;
                    }
                    $scope.selectedReadType = readTypes[index];
                    $scope.challenge.type = types[index];
                };
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                template: '<md-dialog aria-label="Challenge dialog">' +
                '  <md-dialog-content>' +
                '   <md-menu>' +
                '       <md-button aria-label="Challenge type" class="md-raised md-primary" ng-click="openMenu($mdOpenMenu, $event)">' +
                '           Type:{{selectedReadType}}' +
                '       </md-button>' +
                '       <md-menu-content width="4">' +
                '           <md-menu-item ng-repeat="readType in readTypes">' +
                '               <md-button ng-click="chooseType($index)"> {{readType}}' +
                '              </md-button>' +
                '           </md-menu-item>' +
                '       </md-menu-content>' +
                '   </md-menu>' +
                '    <md-input-container>' +
                '       <label>Challenge name</label>' +
                '       <input type="text" ng-model="challenge.name">' +
                '   </md-input-container>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <md-button ng-click="closeDialog()" class="md-primary">' +
                '      Close Dialog' +
                '    </md-button>' +
                '    <md-button ng-click="addChallenge()" class="md-primary">' +
                '     Add Challenge' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                locals: {
                    challenge: $scope.challenge,
                    types: $scope.types,
                    readTypes: $scope.readTypes
                },
                controller: DialogController
            });
        }

        $scope.showDialog = showDialog;

        $scope.types = ['mcq', 'dnd'];
        $scope.readTypes = ['Multiple Choice Question', 'Drag And Drop'];

        function updateChallenges() {
            $scope.challenges = Challenges.query(function () {
                console.log($scope.challenges[0]);
            });
        }

        updateChallenges();

        $scope.challenge = new Challenges();
        $scope.challenge.type = $scope.types[0];
        $scope.go = function (challenge) {
            console.log('go', challenge);
            $location.path('/challenges/edit/' + challenge._id + '/' + challenge.type);
        };
    }
]);
