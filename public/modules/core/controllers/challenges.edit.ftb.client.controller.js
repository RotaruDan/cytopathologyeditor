'use strict';


angular.module('core').controller('ChallengesEditFtbController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function () {
            var formData = new FormData();


            angular.forEach($scope.files, function (obj) {
                formData.append('files', obj.lfFile);
            });

            // Upload the selected Photo
            $http.post('/upload/' + challengeId, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function (res) {
                console.log('success!!', res);

                // If the photo was correctly uploaded
                // Upload the challenge JSON Data Model
                var j = 0;

                // Copy into 'answers' the $scope.mcqs added by the user
                $scope.challenge.challengeFile.imagePath = $scope.files[0].lfFileName;
                $scope.challenge.challengeFile.textControl.answers = [];
                $scope.mcqs.forEach(function (question) {

                    $scope.challenge.challengeFile.textControl.answers.
                        push(question.string);
                    if (question.isCorrect) {
                        $scope.challenge.challengeFile.textControl.correctAnswer = j;
                    }
                    ++j;
                });

                // TODO this UPDATE method doesn't work...try $scope.challenge.$save()?
                var challengeFile = $scope.challenge.challengeFile;
                $scope.challenge.$update();

            }).error(function () {
                console.log('error!!');
            });
        };


        //-----------------------------

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

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
                        'textControl': {
                            'class': 'es.eucm.cytochallenge.model.control.MultipleAnswerControl',   // Can be ignored (used by the client json parser)
                            'text': '',
                            'answers': [],
                            'correctAnswer': 0
                        }
                    };
                }
                var i = 0;
                $scope.challenge.challengeFile.textControl.answers.
                    forEach(function (answer) {
                        $scope.mcqs.push({
                            string: answer,
                            isCorrect: i === $scope.challenge.challengeFile.textControl.correctAnswer
                        });
                        ++i;
                    });
            }, function (error) {
                console.log('error retrieving challenge', error);

            });

        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: ''
        }];

        // Canvas for image manipulation (draw polygons or multiple images)
        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');

        var imageObj = new Image();
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
                    ctx.drawImage(this, (targetWidth - width) * 0.5, (targetHeight - height) * 0.5, width, height);
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
    }
]);
