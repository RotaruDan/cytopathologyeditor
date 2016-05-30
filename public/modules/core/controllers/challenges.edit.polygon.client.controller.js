'use strict';


angular.module('core').controller('ChallengesEditPolygonController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {

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
            $scope.challenge.challengeFile.textControl.correctAnswers = [];
            $scope.mcqs.forEach(function (question) {
                if (question.points.length > 5) {
                    var polygon = [];
                    for (var i = 0; i < question.points.length; i += 2) {
                        polygon.push(question.points[i]);
                        polygon.push(canv.height - question.points[i + 1]);
                    }
                    $scope.challenge.challengeFile.textControl.answers.push(polygon);
                    // TODO polygons
                    if (question.isCorrect) {
                        $scope.challenge.challengeFile.textControl.correctAnswers.push(j);
                    }

                    ++j;
                }
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
                    var i = 0;
                    if (res.challengeFile.imagePath) {
                        imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
                        console.log(thisFiles);
                        thisFiles[0].lfFileName = res.challengeFile.imagePath;
                    }

                    $scope.challenge.challengeFile.textControl.answers.
                        forEach(function (answer) {
                            var pointsPoly = [];

                            for (var j = 0; j < answer.length; j += 2) {
                                pointsPoly.push(answer[j]);
                                pointsPoly.push(canv.height - answer[j + 1]);
                            }

                            $scope.mcqs[i] = {
                                points: pointsPoly,
                                isCorrect: $scope.challenge.challengeFile.textControl.correctAnswers.indexOf(i) !== -1
                            };
                            ++i;
                        });
                    draw();
                }, function (error) {
                    console.log('error retrieving challenge', error);

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
            ctx.drawImage(imageObj, (targetWidth - width) * 0.5, (targetHeight - height) * 0.5, width, height);

        };

        var draw, mousedown, stopdrag, move, rightclick;

        $scope.$watchCollection('files', function (newValue, oldValue) {
            if (newValue && newValue.length === 1) {

                // If a new image was uploaded, position it in the center of the canvas
                imageObj.src = newValue[0].lfDataUrl;
                imageObj.onload = function () {
                    imageObj.isLoaded = true;
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
            var points = $scope.mcqs[$scope.mcqs.length - 1].points;
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
            var points = $scope.mcqs[$scope.mcqs.length - 1].points;
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
            ctx.canvas.width = ctx.canvas.width;

            var points = $scope.mcqs[$scope.mcqs.length - 1].points;
            if (points.length < 2) {
                return false;
            }

            $scope.mcqs.forEach(function (polygon) {
                var points = polygon.points;
                ctx.globalCompositeOperation = 'destination-over';
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


            drawImageObj();

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
    }
]);
