'use strict';


angular.module('core').controller('ChallengesController', ['$rootScope', '$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($rootScope, $scope, Challenges, $location, $mdDialog, QueryParams, $http, sharedProperties) {
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
                'difficulty': 'EASY',
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
                'difficulty': 'EASY',
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
                difficulty: 'EASY',
                textControl: {
                    class: 'es.eucm.cytochallenge.model.control.MultipleImageAnswerControl',
                    text: '',
                    answers: [],
                    correctAnswers: []
                }
            },
            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',
                'difficulty': 'EASY',
                'imagePath': '',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.filltheblank.FillTheBlankControl',
                    'text': '',
                    'statements': []
                }
            },
            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',
                'imagePath': '',
                'difficulty': 'EASY',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.InteractiveZoneControl',
                    'text': '',
                    'canvasWidth': 1024,
                    'canvasHeight': 552,
                    'answers': [],
                    'correctAnswers': []
                }
            }
        ];


        var go = function (challenge) {
            $rootScope.challenge = challenge;
            sharedProperties.setChallenge(challenge);
            $location.path('/challenges/edit/' + challenge._id + '/' + challenge.type);
        };

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
                    $scope.challenge._course = QueryParams.getCourseId();
                    var challenge = $scope.challenge;
                    $scope.challenge.$save(function (err, res) {
                        $scope.closeDialog();
                        go(challenge);
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
                templateUrl: 'modules/core/views/challenge.add.dialog.html',

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
            $http.get('/courses/' + QueryParams.getCourseId() + '/challenges')
                .success(function (res) {
                    $scope.challenges = res;
                }).error(function (err) {
                    console.log('Error updating challenges', err);
                });
        }

        updateChallenges();

        $scope.challenge = new Challenges();
        $scope.challenge.type = $scope.types[0];
        $scope.challenge.challengeFile = challengesFiles[0];
        $scope.go = go;
    }
]);
