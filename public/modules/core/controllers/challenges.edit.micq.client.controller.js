'use strict';


angular.module('core').controller('ChallengesEditMicqController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {


        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }, {
            lfDataUrl: '',
            lfFileName: ''
        }, {
            lfDataUrl: '',
            lfFileName: ''
        }, {
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [{
            isCorrect: false
        }, {
            isCorrect: false
        }, {
            isCorrect: false
        }, {
            isCorrect: false
        }];

        var updateCurrentChallengeModel = function () {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model

            // Copy into 'answers' the $scope.mcqs added by the user
            if ($scope.files && $scope.files.length > 3 &&
                $scope.files[0].length &&
                $scope.files[1].length &&
                $scope.files[2].length &&
                $scope.files[3].length) {
                $scope.challenge.challengeFile.textControl.answers = [];
                for (var i = 0; i < 4; ++i) {
                    if ($scope.files[i][0].lfFileName) {
                        $scope.challenge.challengeFile.textControl.answers.push($scope.files[i][0].lfFileName);
                    }
                }
            }

            var j = 0;
            $scope.challenge.challengeFile.textControl.correctAnswers = [];
            $scope.mcqs.forEach(function (question) {
                if (question.isCorrect) {
                    $scope.challenge.challengeFile.textControl.correctAnswers.push(j);
                }
                ++j;
            });

            $scope.challenge.$update();
            queryChallenge();
        };

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function () {
            var formData = new FormData();

            if ($scope.files &&
                $scope.files.length &&
                $scope.files[0].length &&
                $scope.files[1].length &&
                $scope.files[2].length &&
                $scope.files[3].length) {
                angular.forEach($scope.files, function (obj) {
                    formData.append('files[]', obj[0].lfFile);
                });
            } else {
                return updateCurrentChallengeModel();
            }

            // Upload the selected Photo
            $http.post('/uploads/' + challengeId, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function (res) {
                console.log('success!!', res);
                updateCurrentChallengeModel();
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel();
            });
        };


        //-----------------------------


        var thisFiles = $scope.files;
        var imageObj = new Image();
        var queryChallenge = function() {
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
                            class: 'es.eucm.cytochallenge.model.TextChallenge',
                            difficulty: 'EASY',
                            textControl: {
                                class: 'es.eucm.cytochallenge.model.control.MultipleImageAnswerControl',
                                text: '',
                                answers: [],
                                correctAnswers: []
                            }
                        };
                    }
                    var i = 0;
                    $scope.mcqs[0].isCorrect = false;
                    $scope.mcqs[1].isCorrect = false;
                    $scope.mcqs[2].isCorrect = false;
                    $scope.mcqs[3].isCorrect = false;
                    if ($scope.challenge.challengeFile.textControl.correctAnswers) {
                        $scope.challenge.challengeFile.textControl.correctAnswers.
                            forEach(function (answer) {
                                $scope.mcqs[answer].isCorrect = true;
                                ++i;
                            });
                    }
                    if ($scope.challenge.challengeFile.textControl.answers) {
                        i = 0;
                        $scope.challenge.challengeFile.textControl.answers.forEach(function (answer) {
                            popImage({lfDataUrl: 'uploads/' + res._id + '/' + answer},
                                new Image(), i);

                            ++i;
                        });
                    }
                }, function (error) {
                    console.log('error retrieving challenge', error);

                });
        };

        queryChallenge();

        // Canvas for image manipulation (draw polygons or multiple images)
        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');

        var popImage = function (file, image, index) {
            // If a new image was uploaded, position it in the center of the canvas
            image.src = file.lfDataUrl;
            image.onload = function () {

                var targetHeight = canv.height / 2;
                var targetWidth = canv.width / 2;
                var sourceHeight = image.height;
                var sourceWidth = image.width;

                var targetRatio = targetHeight / targetWidth;
                var sourceRatio = sourceHeight / sourceWidth;
                var scale = targetRatio > sourceRatio ? targetWidth / sourceWidth : targetHeight / sourceHeight;

                var width = sourceWidth * scale;
                var height = sourceHeight * scale;

                var x = 0;
                var y = 0;

                if (index === 0) {
                    x = 0;
                    y = 0;
                } else if (index === 1) {
                    x = targetWidth;
                    y = 0;
                } else if (index === 2) {
                    x = 0;
                    y = targetHeight;
                } else {
                    x = targetWidth;
                    y = targetHeight;
                }

                ctx.clearRect(x, y, targetWidth, targetHeight);
                ctx.drawImage(image, x + (targetWidth - width) * 0.5, y + (targetHeight - height) * 0.5, width, height);

            };
        };
        var checkImage = function (index) {
            return function (newValue, oldValue) {
                if (newValue && newValue.length === 1) {
                    popImage(newValue[0], imageObj, index);
                }
            };
        };
        for (var i = 0; i < 4; ++i) {
            $scope.$watchCollection('files[' + i + ']', checkImage(i));
        }

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
                isCorrect: false
            });
        };

        $scope.chooseDifficulty = function (difficulty) {
            $scope.challenge.challengeFile.difficulty = difficulty;
        };
    }
]);
