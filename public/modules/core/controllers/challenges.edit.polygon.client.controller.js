'use strict';


angular.module('core').controller('ChallengesEditPolygonController', ['$scope', 'Challenges', '$location',
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

        var offsetX = 0, offsetY = 0;
        var canvasW = 0, canvasH = 0;

        // Canvas for image manipulation (draw polygons or multiple images)
        var canv = document.getElementById('board');
        var ctx = canv.getContext('2d');

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
            $scope.challenge.challengeFile.textControl.correctAnswers = [];
            $scope.mcqs.forEach(function (question) {
                if (question.points.length > 5) {
                    var polygon = [];
                    for (var i = 0; i < question.points.length; i += 2) {

                        var canvasX = question.points[i] - offsetX;
                        var canvasY = canv.height - question.points[i + 1] - offsetY;

                        var playW = imageObj.width;
                        var playH = imageObj.height;

                        var playX = (canvasX * playW ) / canvasW;
                        var playY = (canvasY * playH) / canvasH;

                        polygon.push(playX);
                        polygon.push(playY);
                    }
                    $scope.challenge.challengeFile.textControl.answers.push(polygon);

                    if (question.isCorrect) {
                        $scope.challenge.challengeFile.textControl.correctAnswers.push(j);
                    }

                    ++j;
                }
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
                            'class': 'es.eucm.cytochallenge.model.TextChallenge',
                            'imagePath': '',
                            'difficulty': 'EASY',
                            'textControl': {
                                'class': 'es.eucm.cytochallenge.model.control.InteractiveZoneControl',
                                'text': '',
                                'canvasWidth': 1024,
                                'canvasHeight': 552,
                                'answers': [],
                                'correctAnswers': []
                            }
                        };
                    }
                    if (res.challengeFile.imagePath) {
                        imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
                        imageObj.computePositions = true;
                        thisFiles[0].lfFileName = res.challengeFile.imagePath;
                    }
                    var i = 0;
                    $scope.challenge.challengeFile.textControl.answers.
                        forEach(function (answer) {
                            $scope.mcqs[i] = {
                                points: [-100, -100, -100, -100, -100, -100],
                                isCorrect: $scope.challenge.challengeFile.textControl.correctAnswers.indexOf(i) !== -1
                            };
                            ++i;
                        });
                    draw();
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

        var computePositions = function () {
            var i = 0;
            $scope.challenge.challengeFile.textControl.answers.
                forEach(function (answer) {
                    var pointsPoly = [];

                    for (var j = 0; j < answer.length; j += 2) {

                        var playX = answer[j];
                        var playY = answer[j + 1];

                        var playW = imageObj.width;
                        var playH = imageObj.height;

                        var canvasX = ((playX * canvasW) / playW) + offsetX;
                        var canvasY = (playY * canvasH) / playH;
                        canvasY = canvasH - (canvasY) + offsetY;

                        pointsPoly.push(canvasX);
                        pointsPoly.push(canvasY);
                    }

                    $scope.mcqs[i] = {
                        points: pointsPoly,
                        isCorrect: $scope.challenge.challengeFile.textControl.correctAnswers.indexOf(i) !== -1
                    };
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

            console.log('drawinggggg');

            offsetX = (targetWidth - width) * 0.5;
            offsetY = (targetHeight - height) * 0.5;

            canvasW = width;
            canvasH = height;
            console.log('offsetX', offsetX, 'offsetY', offsetY, 'width', width, 'height', height);

            ctx.drawImage(imageObj, offsetX, offsetY, width, height);

        };

        var draw, mousedown, stopdrag, move, rightclick;

        $scope.$watchCollection('files', function (newValue, oldValue) {
            if (newValue && newValue.length === 1) {

                // If a new image was uploaded, position it in the center of the canvas
                imageObj.src = newValue[0].lfDataUrl;
                imageObj.onload = function () {
                    imageObj.isLoaded = true;
                    console.log('loadeddddddd');
                    draw();
                };
            }
        });

        //-----------------
        // CANVAS LOGIC

        var activePoint;

        move = function (e) {
            if (!e.offsetX) {
                e.offsetX = (e.pageX - $(e.target).offset().left);
                e.offsetY = (e.pageY - $(e.target).offset().top);
            }
            var points = $scope.mcqs[$scope.mcqs.length - 1].points;
            points[activePoint] = Math.round(e.offsetX);
            points[activePoint + 1] = Math.round(e.offsetY);
            draw();
        };

        stopdrag = function () {
            canv.onmousemove = null;
            activePoint = null;
        };

        rightclick = function (e) {
            e.preventDefault();
            if (!e.offsetX) {
                e.offsetX = (e.pageX - $(e.target).offset().left);
                e.offsetY = (e.pageY - $(e.target).offset().top);
            }
            var pointsObj = $scope.mcqs[$scope.mcqs.length - 1];
            if (!pointsObj) {
                return false;
            }
            var points = pointsObj.points;
            var x = e.offsetX, y = e.offsetY;
            for (var i = 0; i < points.length; i += 2) {
                var dis = Math.sqrt(Math.pow(x - points[i], 2) + Math.pow(y - points[i + 1], 2));
                if (dis < 6) {
                    points.splice(i, 2);
                    draw();
                    return false;
                }
            }
            return false;
        };

        var i;
        mousedown = function (e) {
            var pointsObj = $scope.mcqs[$scope.mcqs.length - 1];
            if (!pointsObj) {
                return false;
            }
            var points = pointsObj.points;
            var x, y, dis, lineDis, insertAt = points.length;

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

            for (i = 0; i < points.length; i += 2) {
                dis = Math.sqrt(Math.pow(x - points[i], 2) + Math.pow(y - points[i + 1], 2));
                if (dis < 6) {
                    activePoint = i;
                    canv.onmousemove = move;
                    return false;
                }
            }

            for (i = 0; i < points.length; i += 2) {
                if (i > 1) {
                    lineDis = dotLineLength(
                        x, y,
                        points[i], points[i + 1],
                        points[i - 2], points[i - 1],
                        true
                    );
                    if (lineDis < 6) {
                        insertAt = i;
                    }
                }
            }

            points.splice(insertAt, 0, Math.round(x), Math.round(y));
            activePoint = insertAt;
            canv.onmousemove = move;

            draw();

            return false;
        };

        draw = function () {

            ctx.clearRect(0, 0, canv.width, canv.height);
            drawImageObj();

            if (imageObj.isLoaded && imageObj.computePositions) {
                imageObj.computePositions = false;
                computePositions();
            }

            if (!$scope.mcqs) {
                return false;
            }
            var pointsOpt = $scope.mcqs[$scope.mcqs.length - 1];
            if (!pointsOpt) {
                return false;
            }
            var points = pointsOpt.points;
            if (points && points.length < 2) {
                return false;
            }

            $scope.mcqs.forEach(function (polygon) {
                var points = polygon.points;
                ctx.fillStyle = 'rgb(255,255,255)';
                ctx.strokeStyle = polygon.isCorrect ? 'rgb(20, 255, 20)' : 'rgb(255,20,20)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(points[0], points[1]);
                for (var i = 0; i < points.length; i += 2) {
                    ctx.fillRect(points[i] - 2, points[i + 1] - 2, 4, 4);
                    ctx.strokeRect(points[i] - 2, points[i + 1] - 2, 4, 4);
                    if (points.length > 2 && i > 1) {
                        ctx.lineTo(points[i], points[i + 1]);
                    }
                }
                ctx.closePath();
                ctx.fillStyle = polygon.isCorrect ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)';
                ctx.fill();
                ctx.stroke();
            });

            console.log(JSON.stringify(points, null, '   '));
        };

        canv.onmousedown = mousedown;
        canv.oncontextmenu = rightclick;
        canv.onmouseup = stopdrag;
        $scope.draw = draw;


        var dotLineLength = function (x, y, x0, y0, x1, y1, o) {
            function lineLength(x, y, x0, y0) {
                return Math.sqrt((x -= x0) * x + (y -= y0) * y);
            }

            if (o && !(o = (function (x, y, x0, y0, x1, y1) {
                    var x10 = (x1 - x0);
                    if (!x10) return {x: x0, y: y};
                    else {
                        var y10 = (y1 - y0);
                        if (!y10) return {x: x, y: y0};
                    }
                    var left, tg = -1 / ((y1 - y0) / (x1 - x0));
                    return {
                        x: left = (x1 * (x * tg - y + y0) + x0 * (x * -tg + y - y1)) / (tg * (x1 - x0) + y0 - y1),
                        y: tg * left - tg * x + y
                    };
                }(x, y, x0, y0, x1, y1)),
                o.x >= Math.min(x0, x1) &&
                o.x <= Math.max(x0, x1) &&
                o.y >= Math.min(y0, y1) &&
                o.y <= Math.max(y0, y1))) {
                var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
                return l1 > l2 ? l2 : l1;
            } else {
                var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
                return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
            }
        };

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
            draw();
        };

        // Adds a new Option to the list
        $scope.addOption = function () {
            if ($scope.mcqs.length === 0 ||
                $scope.mcqs[$scope.mcqs.length - 1].points.length > 5) {
                $scope.addToList('mcqs', {
                    points: [],
                    isCorrect: false
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
