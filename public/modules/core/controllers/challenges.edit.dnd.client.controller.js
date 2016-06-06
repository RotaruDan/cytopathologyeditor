'use strict';


angular.module('core').controller('ChallengesEditDndController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {

        var offsetX = 0, offsetY = 0;
        var canvasW = 0, canvasH = 0;

        // Canvas for image manipulation (draw polygons or multiple images)
        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');
        var textHeight = 20;

        var imageObj = new Image();
        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        $scope.hintFiles = [];

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

                var canvasX = question.x - offsetX;
                var canvasY = canv.height - (question.y + question.height) - offsetY;

                var playW = imageObj.width;
                var playH = imageObj.height;
                console.log('image size ' + playW + ', ' + playH);

                var playX = (canvasX * playW ) / canvasW;
                var playY = (canvasY * playH) / canvasH;

                $scope.challenge.challengeFile.textControl.answers.
                    push({
                        text: question.string,
                        x: playX,
                        y: playY,
                        width: question.width,
                        height: question.height
                    });

                ++j;
            });

            $scope.challenge.$update();

            queryChallenge(callback);
        };

        var addHintFiles = function (callback) {
            var formData = new FormData();
            if ($scope.hintFiles && $scope.hintFiles.length > 0) {
                angular.forEach($scope.hintFiles, function (obj) {
                    formData.append('files[]', obj.lfFile);
                });
            } else {
                return updateCurrentChallengeModel(callback);
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
                updateCurrentChallengeModel(callback);
            }).error(function (err) {
                console.log('hints error!!', err);
                updateCurrentChallengeModel(callback);
            });
        };


        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function (callback) {
            var formData = new FormData();

            if ($scope.files && $scope.files.length && $scope.files[0].lfFile) {
                formData.append('files', $scope.files[0].lfFile);
            } else {
                return addHintFiles(callback);
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
                addHintFiles(callback);
            }).error(function (err) {
                console.log('error!!', err);
                addHintFiles(callback);
            });
        };


        //-----------------------------


        var thisFiles = $scope.files;
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
                        }
                        ;
                    }
                    if (res.challengeFile.imagePath) {
                        imageObj.isLoaded = false;
                        imageObj.computePositions = true;
                        imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
                        thisFiles[0].lfFileName = res.challengeFile.imagePath;
                    }

                    $scope.mcqs = [];
                    var i = 0;
                    $scope.challenge.challengeFile.textControl.answers.
                        forEach(function (answer) {

                            $scope.mcqs[i] = {
                                string: answer.text,
                                x: -500,
                                y: -500,
                                width: answer.width,
                                height: answer.height
                            };

                            console.log(JSON.stringify($scope.mcqs[i], null, '  '));
                            ++i;
                        });
                    draw();

                    if (callback) {
                        callback();
                    }
                }, function
                    (error) {
                    console.log('error retrieving challenge', error);

                    if (callback) {
                        callback();
                    }
                }
            )
            ;
        };

        var computePositions = function () {
            var i = 0;
            $scope.challenge.challengeFile.textControl.answers.
                forEach(function (answer) {

                    var playY = answer.y;
                    var playX = answer.x;

                    var playW = imageObj.width;
                    var playH = imageObj.height;

                    var canvasX = ((playX * canvasW) / playW) + offsetX;
                    var canvasY = (playY * canvasH) / playH;
                    canvasY = canvasH - (canvasY + answer.height) + offsetY;

                    console.log('playW', playW);
                    console.log('canvasW', canvasW);
                    console.log('offsetX', offsetX);
                    console.log('canvasX', canvasX);

                    $scope.mcqs[i] = {
                        string: answer.text,
                        x: canvasX,
                        y: canvasY,
                        width: answer.width,
                        height: answer.height
                    };

                    console.log(JSON.stringify($scope.mcqs[i], null, '  '));
                    ++i;
                });
        };

        queryChallenge();

        var drawImageObj = function () {
            if (!imageObj.isLoaded) {
                return;
            }
            var targetHeight = canv.height;
            var targetWidth = canv.width;
            var sourceHeight = imageObj.height;
            var sourceWidth = imageObj.width;

            var targetRatio = targetHeight / targetWidth;
            var sourceRatio = sourceHeight / sourceWidth;
            var scale = targetRatio > sourceRatio ? targetWidth / sourceWidth : targetHeight / sourceHeight;

            var width = sourceWidth * scale;
            var height = sourceHeight * scale;

            offsetX = (targetWidth - width) * 0.5;
            offsetY = (targetHeight - height) * 0.5;

            canvasW = width;
            canvasH = height;
            ctx.drawImage(imageObj, offsetX, offsetY, width, height);
        };

        // ----canvas
        var draw, mousedown, stopdrag, move, activeText;

        $scope.$watchCollection('files', function (newValue, oldValue) {
            if (newValue && newValue.length === 1) {

                // If a new image was uploaded,
                // position it in the center of the canvas
                imageObj.src = newValue[0].lfDataUrl;
                imageObj.onload = function () {
                    imageObj.isLoaded = true;
                    draw();
                };
            }
        });

        move = function (e) {
            if (!e.offsetX) {
                e.offsetX = (e.pageX - $(e.target).offset().left);
                e.offsetY = (e.pageY - $(e.target).offset().top);
            }
            var textObj = $scope.mcqs[activeText];
            textObj.x = Math.round(e.offsetX) - textObj.width / 2;
            textObj.y = Math.round(e.offsetY) - textObj.height / 2;
            draw();
        };

        stopdrag = function () {
            canv.onmousemove = null;
            activeText = null;
        };

        var contains = function (obj, x, y) {
            return x >= obj.x &&
                x < obj.x + obj.width &&
                y >= obj.y &&
                y < obj.y + obj.height;
        };

        var i;
        mousedown = function (e) {
            var x, y;

            if (e.which === 3) {
                return false;
            }

            e.preventDefault();
            if (!e.offsetX) {
                e.offsetX = (e.pageX - $(e.target).offset().left);
                e.offsetY = (e.pageY - $(e.target).offset().top);
            }
            x = e.offsetX;
            y = e.offsetY;

            for (i = 0; i < $scope.mcqs.length; i++) {
                if (contains($scope.mcqs[i], x, y)) {
                    activeText = i;
                    canv.onmousemove = move;
                    return false;
                }
            }

            return false;
        };

        draw = function () {

            ctx.clearRect(0, 0, canv.width, canv.height);
            drawImageObj();
            if (imageObj.isLoaded && imageObj.computePositions) {
                imageObj.computePositions = false;
                computePositions();
            }
            drawText();
        };

        canv.onmousedown = mousedown;
        canv.onmouseup = stopdrag;
        $scope.draw = draw;

//------

        function drawText() {
            ctx.font = textHeight + 'pt sans-serif';
            for (var i = 0; i < $scope.mcqs.length; i++) {
                var textObj = $scope.mcqs[i];
                ctx.fillStyle = 'white';
                ctx.fillRect(textObj.x, textObj.y, textObj.width, textObj.height);
                ctx.fillStyle = 'black';
                ctx.fillText(textObj.string,
                    textObj.x + (textObj.width - ctx.measureText(textObj.string).width) / 2,
                    textObj.y + textHeight + (textObj.height - textHeight) / 2);
            }
        }

//------------------

        $scope.$watchCollection('mcqs', function () {
            draw();
        });

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
                x: canv.width / 2,
                y: canv.height / 2,
                width: textHeight,
                height: textHeight * 2
            });
        };

        $scope.textChanged = function (option) {
            option.width = ctx.measureText(option.string).width + textHeight;
            console.log(option.width);
            draw();
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
