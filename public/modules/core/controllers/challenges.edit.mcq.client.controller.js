'use strict';


angular.module('core').controller('ChallengesEditMcqController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {

        $scope.uploadFile = function () {
            var file = $scope.myFile;
            var challengeId = QueryParams.getQueryParam('edit');
            var uploadUrl = '/upload/571cd46c5d1f6d7c066d9bd7';
            var fd = new FormData();
            fd.append('file', file);

            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function () {
                console.log('success!!');
            }).error(function () {
                console.log('error!!');
            });
        };

        $scope.onSubmit = function () {
            var formData = new FormData();
            angular.forEach($scope.files, function (obj) {
                formData.append('files[]', obj.lfFile);
            });
            $http.post('/upload/571cd46c5d1f6d7c066d9bd7', formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    enctype: 'multipart/form-data'
                }
            }).success(function () {
                console.log('success!!');
                $scope.challenge.$update();
            }).error(function () {
                console.log('error!!');
            });
        };


        //-----------------------------

        $scope.challenge = sharedProperties.getChallenge();
        $scope.challenge.challengeFile = {
            'class': 'es.eucm.cytochallenge.model.TextChallenge',
            'imagePath': '',
            'textControl': {
                'class': 'es.eucm.cytochallenge.model.control.MultipleAnswerControl',
                'text': '',
                'answers': [ ],
                'correctAnswer': 0
            }
        };

        $scope.files = [{
            lfDataUrl: ''
        }];

        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');


        var imageObj = new Image();
        $scope.$watchCollection('files', function (newValue, oldValue) {
            if (newValue && newValue.length === 1) {

                console.log(newValue);

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

        $scope.description = '';
        $scope.mcqs = [];

        $scope.addToList = function (list, object) {
            if (!$scope[list]) {
                $scope[list] = [];
            }
            $scope[list].push(object);
            //$scope.$save();
        };

        $scope.deleteFromList = function (list, object) {
            var index = $scope[list].indexOf(object);
            if (index > -1) {
                $scope[list].splice(index, 1);
            }
            //$scope.$save();
        };

        $scope.addOption = function () {
            $scope.addToList('mcqs', {
                string: '',
                isCorrect: false
            });
        };
    }
]);
