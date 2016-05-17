'use strict';


angular.module('core').controller('ChallengesEditDndController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {


        // Canvas for image manipulation (draw polygons or multiple images)
        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');
        var textHeight = 20;

        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function () {

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
                    push({
                        text: question.string,
                        x: question.x,
                        y: canv.height - question.y,
                        width: question.width,
                        height: question.height
                    });

                ++j;
            });

            $scope.challenge.$update();

            queryChallenge();
        };

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function () {
            var formData = new FormData();

            if ($scope.files && $scope.files.length && $scope.files[0].lfFile) {
                formData.append('files', $scope.files[0].lfFile);
            } else {
                return updateCurrentChallengeModel();
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
                updateCurrentChallengeModel();
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel();
            });
        };


        //-----------------------------


        var thisFiles = $scope.files;
        var imageObj = new Image();
        console.log('before query', $scope.files);
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
                                'class': 'es.eucm.cytochallenge.model.control.draganddrop.DragAndDropControl',
                                'text': '',
                                'canvasWidth': 1024,
                                'canvasHeight': 552,
                                'answers': []
                            }
                        }
                        ;
                    }
                    var i = 0;
                    if (res.challengeFile.imagePath) {
                        imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
                        console.log(thisFiles);
                        thisFiles[0].lfFileName = res.challengeFile.imagePath;
                    }

                    $scope.mcqs[i] = [];
                    $scope.challenge.challengeFile.textControl.answers.
                        forEach(function (answer) {
                            $scope.mcqs[i] = {
                                string: answer.text,
                                x: answer.x,
                                y: canv.height - answer.y,
                                width: answer.width,
                                height: answer.height
                            };
                            ++i;
                        });
                    draw();
                }, function
                    (error) {
                    console.log('error retrieving challenge', error);

                }
            )
            ;
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
            ctx.drawImage(imageObj, (targetWidth - width) * 0.5, (targetHeight - height) * 0.5, width, height);

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
            console.log('move', JSON.stringify(textObj, null, '  '));
            draw();
        };

        stopdrag = function () {
            console.log('stopdrag');
            canv.onmousemove = null;
            activeText = null;
        };

        var contains = function (obj, x, y) {
            console.log('contains', JSON.stringify(obj, null, '  '), x, y);
            return x >= obj.x &&
                x < obj.x + obj.width &&
                y >= obj.y &&
                y < obj.y + obj.height;
        };

        var i;
        mousedown = function (e) {
            console.log('mousedown');
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
                console.log('looping', i);
                if (contains($scope.mcqs[i], x, y)) {
                    console.log('contains');
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
    }
])
;
