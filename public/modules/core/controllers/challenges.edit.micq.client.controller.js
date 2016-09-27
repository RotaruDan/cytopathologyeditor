'use strict';


angular.module('core').controller('ChallengesEditMicqController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', '$mdToast', 'thumbnails',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, $mdToast, thumbnails) {

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

        $scope.hintFiles = [];

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

        var updateCurrentChallengeModel = function (callback, showToast) {

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
            uploadThumbnailImage(callback, showToast);
        };

        var uploadThumbnailImage = function (callback, showToast) {
            thumbnails.uploadThumbnail(canv, challengeId, function(err) {
                if(err) {
                    console.error('Error uploading thumbnail of challenge!');
                }

                queryChallenge(callback, showToast);
            });
        };
        var challengeId = QueryParams.getChallengeId();

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

        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function (callback, showToast) {
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
                return addHintFiles(callback, showToast);
            }

            // Upload the selected Photo
            $http.post('/uploads/' + challengeId, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function (res) {
                addHintFiles(callback, showToast);
            }).error(function (err) {
                console.log('Uploads error!', err);
                addHintFiles(callback, showToast);
            });
        };


        //-----------------------------


        var imageObj = new Image();
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

                    if (callback) {
                        callback();
                    }
                    if (showToast) {
                        $scope.showSimpleToast('Challenge updated successfully!');
                    }
                }, function (error) {
                    console.log('error retrieving challenge', error);

                    if (callback) {
                        callback();
                    }
                    if (showToast) {
                        $scope.showSimpleToast('An error occurred, please try again!');
                    }
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
                ctx.rect(x, y, targetWidth, targetHeight);
                ctx.stroke();

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
                if ($scope.challenge.challengeFile.textControl.answers.length === 4) {
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
                } else {
                    $scope.showSimpleToast('Please select 4 images first.');
                }
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
