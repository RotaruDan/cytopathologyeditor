'use strict';


angular.module('core').controller('ChallengesEditDndController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http) {

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
            }).error(function () {
                console.log('error!!');
            });
        };


        //-----------------------------

        $scope.files = [{
            lfDataUrl: ''
        }];

        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');


        $scope.$watchCollection('files', function (newValue, oldValue) {
            if (newValue && newValue.length === 1) {

                console.log(newValue);

                var imageObj = new Image();
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
