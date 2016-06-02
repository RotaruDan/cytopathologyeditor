'use strict';


angular.module('core').controller('ChallengesEditMcqController', [
    '$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http) {

        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function (callback) {

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

            queryChallenge(callback);
        };

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function (callback) {
            var formData = new FormData();

            if ($scope.files && $scope.files.length && $scope.files[0].lfFile) {
                formData.append('files', $scope.files[0].lfFile);
            } else {
                return updateCurrentChallengeModel(callback);
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
                updateCurrentChallengeModel(callback);
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel(callback);
            });
        };


        //-----------------------------


        var thisFiles = $scope.files;
        var imageObj = new Image();
        console.log('before query', $scope.files);
        var queryChallenge = function (callback) {
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
                }, function (error) {
                    console.log('error retrieving challenge', error);
                    if (callback) {
                        callback();
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
    }
]);
