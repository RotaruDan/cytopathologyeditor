'use strict';


angular.module('core').controller('ChallengesController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location, $mdDialog, QueryParams, $http, sharedProperties) {
        // ChallengesController controller logic
        // ...


        $scope.types = ['mcq', 'dnd', 'micq', 'ftb', 'polygon'];
        $scope.readTypes = ['Multiple Choice Question', 'Drag And Drop',
            'Multiple Image Choice Question', 'Fill The Options',
            'Highlight Image Area'];
        var challengesFiles = [
            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',   // Can be ignored (used by the client json parser)
                'imagePath': '',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.MultipleAnswerControl',   // Can be ignored (used by the client json parser)
                    'text': '',
                    'answers': [],
                    'correctAnswer': 0
                }
            },

            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',
                'imagePath': '',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.draganddrop.DragAndDropControl',
                    'text': '',
                    'canvasWidth': 1024,
                    'canvasHeight': 552,
                    'answers': []
                }
            },
            {
                class: 'es.eucm.cytochallenge.model.TextChallenge',
                textControl: {
                    class: 'es.eucm.cytochallenge.model.control.MultipleImageAnswerControl',
                    text: '',
                    answers: [],
                    correctAnswers: []
                }
            },
            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',
                'imagePath': '',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.filltheblank.FillTheBlankControl',
                    'text': '',
                    'statements': [
                    ]
                }
            },
            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',
                'imagePath': '',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.InteractiveZoneControl',
                    'text': '',
                    'canvasWidth': 1024,
                    'canvasHeight': 552,
                    'answers': [
                    ],
                    'correctAnswers': []
                }
            }
        ];

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
                    $scope.challenge.challengeFile =
                        challengesFiles[index];
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


        function updateChallenges() {
            $scope.challenges = Challenges.get(function () {
                console.log($scope.challenges[0]);
            });
        }

        updateChallenges();

        $scope.challenge = new Challenges();
        $scope.challenge.type = $scope.types[0];
        $scope.go = function (challenge) {
            sharedProperties.setChallenge(challenge);
            $location.path('/challenges/edit/' + challenge._id + '/' + challenge.type);
        };
    }
]);
