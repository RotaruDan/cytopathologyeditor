'use strict';


angular.module('core').controller('ChallengesEditFtbController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http',  '$mdToast',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, $mdToast) {

        var toastPosition = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };
        $scope.showSimpleToast = function (message) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .position(Object.keys(toastPosition)
                        .filter(function (pos) {
                            return toastPosition[pos];
                        })
                        .join(' '))
                    .hideDelay(3000)
            );
        };

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        $scope.hintFiles = [];
        var updateCurrentChallengeModel = function (callback, showToast) {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            $scope.challenge.challengeFile.textControl.statements = [];
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

            queryChallenge(callback, showToast);
        };


        var addHintFiles = function (callback, showToast) {
            var formData = new FormData();
            if ($scope.hintFiles && $scope.hintFiles.length > 0) {
                angular.forEach($scope.hintFiles, function (obj) {
                    formData.append('files[]', obj.lfFile);
                });
            } else {
                return updateCurrentChallengeModel(callback, showToast);
            }
            // Upload the selected Photo
            $http.post('/hints/' + challengeId, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function (res) {
                updateCurrentChallengeModel(callback, showToast);
            }).error(function (err) {
                console.log('Hints error!', err);
                updateCurrentChallengeModel(callback, showToast);
            });
        };

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function (callback, showToast) {

            addHintFiles(callback, showToast);
        };


        //-----------------------------

        var queryChallenge = function (callback, showToast) {
            Challenges.query({id: challengeId}).
                $promise.then(function (res) {
                    $scope.challenge = res;

                    if (!$scope.challenge.challengeFile ||
                        (typeof $scope.challenge.challengeFile === 'string' ||
                        $scope.challenge.challengeFile instanceof String)) {
                        // This is the initial Challenge Data model for a
                        // Multiple Choice Question challenge
                        $scope.challenge.challengeFile = {
                            'class': 'es.eucm.cytochallenge.model.TextChallenge',
                            'imagePath': '',
                            'difficulty': 'EASY',
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
                    if (callback) {
                        callback();
                    }
                    if(showToast) {
                        $scope.showSimpleToast('Challenge updated successfully!');
                    }
                }, function (error) {
                    if (callback) {
                        callback();
                    }
                    if(showToast) {
                        $scope.showSimpleToast('An error occurred, please try again!');
                    }
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
                    '       <md-icon md-font-set="material-icons">delete</md-icon>' +
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

        $scope.chooseDifficulty = function (difficulty) {
            $scope.challenge.challengeFile.difficulty = difficulty;
        };


        // Preview Dialog Controller
        function DialogController($scope, $mdDialog, challenge) {

            $scope.challenge = challenge;

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
            $scope.getPreviewSrc = function () {
                return '/preview/preview.html?challenge=' + challenge._id;
            };
        }

        $scope.showAdvanced = function (ev) {
            $scope.onSubmit(function () {
                $mdDialog.show({
                    locals: {
                        challenge: $scope.challenge
                    },
                    controller: DialogController,
                    templateUrl: 'modules/core/views/challenge.preview.dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                });
            });
        };


        // HINT Management

        function HintDialogController($scope, $mdDialog,
                                      challenge,
                                      hintFiles,
                                      onSubmit) {

            $scope.challenge = challenge;
            $scope.hints = [];

            var hint = challenge.challengeFile.hint;
            if (hint) {
                var infos = hint.infos;

                if (infos && infos.length > 0) {
                    var i = 0;
                    infos.forEach(function (info) {
                        if (info.text) {
                            $scope.hints.push({
                                type: 'text',
                                string: info.text
                            });
                        } else if (info.imagePath) {
                            $scope.hints.push({
                                type: 'image',
                                src: info.imagePath,
                                index: i
                            });
                        }
                        ++i;
                    });
                }
            }

            var toChallengeModel = function () {
                challenge.challengeFile.hint = {
                    infos: []
                };
                $scope.hints.forEach(function (hint) {
                    if (hint.string) {
                        challenge.challengeFile.hint.infos.push({
                            'class': 'es.eucm.cytochallenge.model.hint.TextInfo',
                            'text': hint.string
                        });
                    } else if (hint.type === 'image') {
                        var i = hint.index;
                        if ($scope.files[i] &&
                            $scope.files[i].length === 1 &&
                            $scope.files[i][0].lfFileName) {
                            challenge.challengeFile.hint.infos.push({
                                'class': 'es.eucm.cytochallenge.model.hint.ImageInfo',
                                'imagePath': 'hints/' + $scope.files[i][0].lfFileName
                            });
                        } else {
                            challenge.challengeFile.hint.infos.push({
                                'class': 'es.eucm.cytochallenge.model.hint.ImageInfo',
                                'imagePath': hint.src
                            });
                        }
                    }
                });
            };

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.files = {};

            $scope.save = function () {
                toChallengeModel();
                if ($scope.files) {
                    for (var fileKey in $scope.files) {
                        var file = $scope.files[fileKey];
                        if (file.length === 1) {
                            hintFiles.push(file[0]);
                        }
                    }
                }
                onSubmit(function () {
                    $mdDialog.hide();
                });
            };

            $scope.getHintImageSrc = function (option) {
                return 'uploads/' + challenge._id + '/' + option.src;
            };

            $scope.addHint = function (index) {

                var hint = {};
                if (index === 0) {
                    hint.type = 'text';
                    hint.string = '';
                } else {
                    hint.type = 'image';
                    hint.src = '';
                    hint.index = $scope.hints.length;
                }
                $scope.hints.push(hint);
            };

            $scope.delete = function (option) {
                var index = $scope.hints.indexOf(option);
                if (index > -1) {
                    $scope.hints.splice(index, 1);
                }
            };
        }

        $scope.showHint = function (ev) {
            $scope.hintFiles = [];
            $scope.onSubmit(function () {
                $mdDialog.show({
                    locals: {
                        challenge: $scope.challenge,
                        hintFiles: $scope.hintFiles,
                        onSubmit: $scope.onSubmit
                    },
                    controller: HintDialogController,
                    templateUrl: 'modules/core/views/challenge.hint.dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                });
            });
        };
    }
]);
