'use strict';


angular.module('core').controller('ChallengesEditFtbController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {



        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function () {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            $scope.challenge.challengeFile.textControl.statements = [];
            console.log(JSON.stringify($scope.mcqs, null, '  '));
            $scope.mcqs.forEach(function (statements) {
                var statement = {
                    text: '',
                    options: [],
                    correctAnswers: []
                };
                var numChoice = 0;
                statements.forEach(function (option) {
                    if (option.type === 'text') {
                        statement.text += option.string;
                    } else if (option.type === 'choice') {
                        statement.text += '[' + numChoice + ']';
                        var correctChoice = 0;
                        var choicesString = [];
                        option.choices.forEach(function (choice) {
                            choicesString.push(choice.string);
                            if (choice.isCorrect) {
                                statement.correctAnswers.push(correctChoice);
                            }
                            ++correctChoice;
                        });
                        statement.options.push(choicesString);
                        ++numChoice;
                    }
                });
                $scope.challenge.challengeFile.textControl.statements.push(statement);
            });

            console.log(JSON.stringify($scope.challenge, null, '  '));

            $scope.challenge.$update();

            queryChallenge();
        };

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function () {

            updateCurrentChallengeModel();
        };


        //-----------------------------

        var queryChallenge = function () {
            Challenges.query({id: challengeId}).
                $promise.then(function (res) {
                    console.log(JSON.stringify(res.challengeFile));

                    $scope.challenge = res;

                    if (!$scope.challenge.challengeFile ||
                        (typeof $scope.challenge.challengeFile === 'string' ||
                        $scope.challenge.challengeFile instanceof String)) {
                        // This is the initial Challenge Data model for a
                        // Multiple Choice Question challenge
                        $scope.challenge.challengeFile = {
                            'class': 'es.eucm.cytochallenge.model.TextChallenge',
                            'imagePath': '',
                            'textControl': {
                                'class': 'es.eucm.cytochallenge.model.control.filltheblank.FillTheBlankControl',
                                'text': '',
                                'statements': []
                            }
                        };
                    }
                    var i = 0;
                    $scope.challenge.challengeFile.textControl.statements.
                        forEach(function (answer) {
                            var text = answer.text;
                            if (text) {
                                $scope.mcqs[i] = [];
                                var slices = text.split(/(\[\d+\])+/);

                                console.log(slices);
                                var j = 0;
                                slices.forEach(function (slice) {
                                    if (slice) {
                                        if (slice.indexOf('[') === 0) {
                                            // is a token
                                            var choices = [];
                                            var x = 0;
                                            answer.options[j].forEach(function (opt) {
                                                choices.push({
                                                    string: opt,
                                                    isCorrect: x === answer.correctAnswers[j]
                                                });
                                                ++x;
                                            });
                                            $scope.mcqs[i].push({
                                                type: 'choice',
                                                choices: choices
                                            });
                                            ++j;
                                        } else {
                                            // is a string
                                            $scope.mcqs[i].push({
                                                type: 'text',
                                                string: slice
                                            });
                                        }
                                    }
                                });

                            }
                            ++i;
                        });
                    console.log('query', JSON.stringify($scope.mcqs, null, '  '));
                }, function (error) {
                    console.log('error retrieving challenge', error);

                });
        };

        queryChallenge();

        //------------------


        // Simple helper method to add to a given list
        $scope.addToList = function (list, object) {
            if (!$scope[list]) {
                $scope[list] = [];
            }
            $scope[list].push(object);
        };

        // Simple helper method to delete from a given list
        $scope.deleteFromList = function (list, object) {
            var index = $scope[list].indexOf(object);
            if (index > -1) {
                $scope[list].splice(index, 1);
            }
        };

        // Adds a new Option to the list
        // An option has the following format
        // { string: 'the option string...',
        //   isCorrect: false }
        $scope.addOptions = function () {
            $scope.addToList('mcqs', []);
        };

        function showDialog($event, options, option) {
            var parentEl = angular.element(document.body);

            function DialogController($scope, $mdDialog, opts, opt) {
                $scope.opt = opt;
                $scope.addChoices = function () {
                    opts.push(opt);
                    $scope.closeDialog();
                };
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.removeChoice = function (choice) {
                    var index = opt.choices.indexOf(choice);
                    if (index > -1) {
                        opt.choices.splice(index, 1);
                    }
                };
                $scope.addChoice = function () {
                    opt.choices.push({
                        string: '',
                        isCorrect: opt.choices.length === 0
                    });
                };
                $scope.checkCorrect = function (opt, choice) {
                    if (choice.isCorrect) {
                        opt.choices.forEach(function (elem) {
                            if (elem !== choice) {
                                elem.isCorrect = false;
                            }
                        });
                    }
                };
            }

            $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    template: '<md-dialog aria-label="Challenge dialog">' +
                    '  <md-dialog-content>' +
                    '<div flex>' +
                    '<strong>Choices</strong>' +
                    '<md-button ng-click="addChoice()" class="md-icon-button" aria-label="Add choices">' +
                    '<md-icon md-font-set="material-icons">add</md-icon>' +
                    '</md-button>' +
                    '</div>' +
                    '<div layout="column" flex>' +
                    '<div ng-repeat="option in opt.choices">' +
                    '    <div layout="row" layout-align="center" flex>' +
                    '<md-input-container flex>' +
                    '<label>Choice {{$index + 1}}</label>' +
                    '<input ng-model="option.string">' +
                    '    </md-input-container>' +
                    '    <md-button aria-label="Remove" ng-click="removeChoice(option)" class="md-icon-button">' +
                    '       <md-icon md-font-set="material-icons">remove</md-icon>' +
                    '    </md-button>' +
                    '<md-checkbox ng-model="option.isCorrect" ng-change="checkCorrect(opt, option)" aria-label="Is a correct option">' +
                    '    </md-checkbox>' +
                    '               </div>' +
                    '              </div> ' +
                    '             </div>' +
                    '  </md-dialog-content>' +
                    '  <md-dialog-actions>' +
                    '    <md-button ng-click="closeDialog()" class="md-primary">' +
                    '      Close Dialog' +
                    '    </md-button>' +
                    '    <md-button ng-click="addChoices()" class="md-primary">' +
                    '     Add Choice' +
                    '    </md-button>' +
                    '  </md-dialog-actions>' +
                    '</md-dialog>',

                    locals: {
                        opts: options,
                        opt: option
                    },
                    controller: DialogController
                }
            );
        }

        $scope.addOption = function (options, index, event) {
            console.log(JSON.stringify(options, null, '  '));
            if (index === 0) {
                options.push({
                    type: 'text',
                    string: ''
                });
            } else {
                var option = {
                    type: 'choice',
                    choices: []
                };

                showDialog(event, options, option);
            }
        };
    }
])
;
