'use strict';


angular.module('core').controller('ChallengesEditMcqController', [
    '$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', '$mdToast',
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
        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];
        $scope.hintFiles = [];

        var updateCurrentChallengeModel = function (callback, showToast) {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            var j = 0;

            // Copy into 'answers' the $scope.mcqs added by the user
            if ($scope.files && $scope.files.length > 0) {
                if ($scope.files[0].lfFileName) {
                    $scope.challenge.challengeFile.imagePath = $scope.files[0].lfFileName;
                }
            }
            $scope.challenge.challengeFile.textControl.answers = [];
            $scope.mcqs.forEach(function (question) {

                $scope.challenge.challengeFile.textControl.answers.
                    push(question.string);
                if (question.isCorrect) {
                    $scope.challenge.challengeFile.textControl.correctAnswer = j;
                }
                ++j;
            });

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
                console.log('hints success!!', res);
                updateCurrentChallengeModel(callback, showToast);
            }).error(function (err) {
                console.log('hints error!!', err);
                updateCurrentChallengeModel(callback, showToast);
            });
        };

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function (callback, showToast) {
            var formData = new FormData();

            if ($scope.files && $scope.files.length && $scope.files[0].lfFile) {
                formData.append('files', $scope.files[0].lfFile);
            } else {
                return addHintFiles(callback, showToast);
            }

            // Upload the selected Photo
            $http.post('/upload/' + challengeId, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function (res) {
                console.log('success!!', res);
                addHintFiles(callback, showToast);
            }).error(function (err) {
                console.log('error!!', err);
                addHintFiles(callback, showToast);
            });
        };

        //-----------------------------

        var thisFiles = $scope.files;
        var imageObj = new Image();
        console.log('before query', $scope.files);
        var queryChallenge = function (callback, showToast) {
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
                            'class': 'es.eucm.cytochallenge.model.TextChallenge',   // Can be ignored (used by the client json parser)
                            'imagePath': '',
                            'difficulty': 'EASY',
                            'textControl': {
                                'class': 'es.eucm.cytochallenge.model.control.MultipleAnswerControl',   // Can be ignored (used by the client json parser)
                                'text': '',
                                'answers': [],
                                'correctAnswer': 0
                            }
                        };
                    }
                    var i = 0;
                    imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
                    console.log(thisFiles);
                    thisFiles[0].lfFileName = res.challengeFile.imagePath;


                    $scope.challenge.challengeFile.textControl.answers.
                        forEach(function (answer) {
                            $scope.mcqs[i] = {
                                string: answer,
                                isCorrect: i === $scope.challenge.challengeFile.textControl.correctAnswer
                            };
                            ++i;
                        });
                    if (callback) {
                        callback();
                    }
                    if(showToast) {
                        $scope.showSimpleToast('Challenge updated successfully!');
                    }
                }, function (error) {
                    console.log('error retrieving challenge', error);
                    if (callback) {
                        callback();
                    }
                    if(showToast) {
                        $scope.showSimpleToast('An error occurred, please try again!');
                    }
                });
        };

        queryChallenge();

        // Canvas for image manipulation (draw polygons or multiple images)
        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');

        $scope.$watchCollection('files', function (newValue, oldValue) {
            if (newValue && newValue.length === 1) {

                // If a new image was uploaded, position it in the center of the canvas
                imageObj.src = newValue[0].lfDataUrl;
                imageObj.onload = function () {

                    var targetHeight = canv.height;
                    var targetWidth = canv.width;
                    var sourceHeight = imageObj.height;
                    var sourceWidth = imageObj.width;

                    var targetRatio = targetHeight / targetWidth;
                    var sourceRatio = sourceHeight / sourceWidth;
                    var scale = targetRatio > sourceRatio ? targetWidth / sourceWidth : targetHeight / sourceHeight;

                    var width = sourceWidth * scale;
                    var height = sourceHeight * scale;
                    ctx.clearRect(0, 0, targetWidth, targetHeight);
                    ctx.drawImage(imageObj, (targetWidth - width) * 0.5, (targetHeight - height) * 0.5, width, height);
                };
            }
        });

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
        $scope.addOption = function () {
            $scope.addToList('mcqs', {
                string: '',
                isCorrect: false
            });
        };

        $scope.checkCorrect = function (option) {
            console.log('changed');
            if (option.isCorrect) {
                $scope.mcqs.forEach(function (question) {
                    if (question !== option) {
                        question.isCorrect = false;
                    }
                });
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
                        console.log('toChallengeModel', i, $scope.files[i]);
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
