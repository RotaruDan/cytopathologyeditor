'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
    // Init module configuration options
    var applicationModuleName = 'material';
    var applicationModuleVendorDependencies = ['ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.utils',
        'ngMaterial',
        'lfNgMdFileInput'];

    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);

//Set up the color theme for the application https://material.angularjs.org/latest/#/Theming/01_introduction
angular.module(ApplicationConfiguration.applicationModuleName)
    .config(["$mdThemingProvider", function ($mdThemingProvider) {
        $mdThemingProvider.definePalette('amazingPaletteName', {
            '50': 'ffffff',
            '100': 'bbdefb',
            '200': '90caf9',
            '300': '64b5f6',
            '400': '42a5f5',
            '500': '2196f3',
            '600': '1e88e5',
            '700': '1976d2',
            '800': '1565c0',
            '900': '0d47a1',
            'A100': '82b1ff',
            'A200': '448aff',
            'A400': '2979ff',
            'A700': '2962ff',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                '200', '300', '400', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
        });
        $mdThemingProvider.theme('default')
            //Custom background palette
            .backgroundPalette('amazingPaletteName', {
                'default': '50'
            })
            .primaryPalette('blue')
            .accentPalette('light-blue');
    }]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Core module config
angular.module('core').run(['Menus',
    function (Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Courses', 'core', 'dropdown', '/courses', 'arrow_forward');
    }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
           state('home', {
                toolbarName: 'Cytopathology Challenge',
                url: '/',
                templateUrl: 'modules/core/views/home.client.view.html'
            }).
            state('courses', {
                toolbarName: 'Courses',
                url: '/courses',
                templateUrl: 'modules/core/views/courses.client.view.html'
            }).
            state('challenges', {
                toolbarName: 'Challenges',
                url: '/challenges/:courseId',
                templateUrl: 'modules/core/views/challenges.client.view.html'
            }).
            state('editmcq', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/mcq',
                templateUrl: 'modules/core/views/edit-mcq.client.view.html'
            }).
            state('editdnd', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/dnd',
                templateUrl: 'modules/core/views/edit-dnd.client.view.html'
            }).
            state('editmicq', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/micq',
                templateUrl: 'modules/core/views/edit-micq.client.view.html'
            }).
            state('editftb', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/ftb',
                templateUrl: 'modules/core/views/edit-ftb.client.view.html'
            }).
            state('editpolygon', {
                toolbarName: 'Challenge',
                url: '/challenges/edit/:challengeId/polygon',
                templateUrl: 'modules/core/views/edit-polygon.client.view.html'
            });
    }
]);

'use strict';


angular.module('core').controller('ChallengesController', ['$rootScope', '$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($rootScope, $scope, Challenges, $location, $mdDialog, QueryParams, $http, sharedProperties) {
        // ChallengesController controller logic
        // ...


        $scope.types = ['mcq', 'dnd', 'micq', 'ftb', 'polygon'];
        $scope.readTypes = ['Multiple Choice Question', 'Drag And Drop',
            'Multiple Image Choice Question', 'Fill The Options',
            'Highlight Image Area'];
        var challengesFiles = [
            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',   // Can be ignored (used by the client json parser)
                'imagePath': '',
                'difficulty': 'EASY',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.MultipleAnswerControl',   // Can be ignored (used by the client json parser)
                    'text': '',
                    'answers': [],
                    'correctAnswer': 0
                }
            },
            {
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
            },
            {
                class: 'es.eucm.cytochallenge.model.TextChallenge',
                difficulty: 'EASY',
                textControl: {
                    class: 'es.eucm.cytochallenge.model.control.MultipleImageAnswerControl',
                    text: '',
                    answers: [],
                    correctAnswers: []
                }
            },
            {
                'class': 'es.eucm.cytochallenge.model.TextChallenge',
                'difficulty': 'EASY',
                'imagePath': '',
                'textControl': {
                    'class': 'es.eucm.cytochallenge.model.control.filltheblank.FillTheBlankControl',
                    'text': '',
                    'statements': []
                }
            },
            {
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
            }
        ];


        var go = function (challenge) {
            $rootScope.challenge = challenge;
            sharedProperties.setChallenge(challenge);
            $location.path('/challenges/edit/' + challenge._id + '/' + challenge.type);
        };

        function showDialog($event) {
            var parentEl = angular.element(document.body);

            function DialogController($scope, $mdDialog, challenge, types, readTypes) {
                $scope.challenge = challenge;
                $scope.types = types;
                $scope.selectedReadType = readTypes[0];
                $scope.readTypes = readTypes;
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };

                $scope.addChallenge = function () {
                    $scope.challenge._course = QueryParams.getCourseId();
                    var challenge = $scope.challenge;
                    $scope.challenge.$save(function (err, res) {
                        $scope.closeDialog();
                        go(challenge);
                    });
                };
                $scope.openMenu = function ($mdOpenMenu, ev) {
                    $mdOpenMenu(ev);
                };
                $scope.chooseType = function (index) {
                    if (!index) {
                        index = 0;
                    }

                    $scope.selectedReadType = readTypes[index];
                    $scope.challenge.type = types[index];
                    $scope.challenge.challengeFile =
                        challengesFiles[index];
                };
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'modules/core/views/challenge.add.dialog.html',

                locals: {
                    challenge: $scope.challenge,
                    types: $scope.types,
                    readTypes: $scope.readTypes
                },
                controller: DialogController
            });
        }

        $scope.showDialog = showDialog;


        function updateChallenges() {
            $http.get('/courses/' + QueryParams.getCourseId() + '/challenges')
                .success(function (res) {
                    $scope.challenges = res;
                }).error(function (err) {
                    console.log('Error updating challenges', err);
                });
        }

        updateChallenges();

        $scope.challenge = new Challenges();
        $scope.challenge.type = $scope.types[0];
        $scope.challenge.challengeFile = challengesFiles[0];
        $scope.go = go;
    }
]);

'use strict';


angular.module('core').controller('ChallengesEditDndController', ['$scope', 'Challenges', '$location',
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
            $scope.mcqs.forEach(function (question) {

                var canvasX = question.x - offsetX;
                var canvasY = canv.height - (question.y + question.height) - offsetY;

                var playW = imageObj.width;
                var playH = imageObj.height;

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
                updateCurrentChallengeModel(callback, showToast);
            }).error(function (err) {
                console.error('Hints error!!', err);
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
                addHintFiles(callback, showToast);
            }).error(function (err) {
                console.error('Upload error!', err);
                addHintFiles(callback, showToast);
            });
        };


        //-----------------------------


        var thisFiles = $scope.files;
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
                    if(showToast) {
                        $scope.showSimpleToast('Challenge updated successfully!');
                    }
                }, function (error) {

                    if (callback) {
                        callback();
                    }
                    if(showToast) {
                        $scope.showSimpleToast('An error occurred, please try again!');
                    }
                }
            );
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

'use strict';


angular.module('core').controller('ChallengesEditFtbController', ['$scope', 'Challenges', '$location',
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

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        $scope.hintFiles = [];
        var updateCurrentChallengeModel = function (callback, showToast) {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            $scope.challenge.challengeFile.textControl.statements = [];
            $scope.mcqs.forEach(function (statements) {
                var statement = {
                    text: '',
                    options: [],
                    correctAnswers: []
                };
                var numChoice = 0;
                statements.forEach(function (option) {
                    if (option.type === 'text') {
                        statement.text += option.string;
                    } else if (option.type === 'choice') {
                        statement.text += '[' + numChoice + ']';
                        var correctChoice = 0;
                        var choicesString = [];
                        option.choices.forEach(function (choice) {
                            choicesString.push(choice.string);
                            if (choice.isCorrect) {
                                statement.correctAnswers.push(correctChoice);
                            }
                            ++correctChoice;
                        });
                        statement.options.push(choicesString);
                        ++numChoice;
                    }
                });
                $scope.challenge.challengeFile.textControl.statements.push(statement);
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
                updateCurrentChallengeModel(callback, showToast);
            }).error(function (err) {
                console.log('Hints error!', err);
                updateCurrentChallengeModel(callback, showToast);
            });
        };

        var challengeId = QueryParams.getChallengeId();
        // Method invoked when the 'Save' button was pressed
        $scope.onSubmit = function (callback, showToast) {

            addHintFiles(callback, showToast);
        };


        //-----------------------------

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
                            'class': 'es.eucm.cytochallenge.model.TextChallenge',
                            'imagePath': '',
                            'difficulty': 'EASY',
                            'textControl': {
                                'class': 'es.eucm.cytochallenge.model.control.filltheblank.FillTheBlankControl',
                                'text': '',
                                'statements': []
                            }
                        };
                    }
                    var i = 0;
                    $scope.challenge.challengeFile.textControl.statements.
                        forEach(function (answer) {
                            var text = answer.text;
                            if (text) {
                                $scope.mcqs[i] = [];
                                var slices = text.split(/(\[\d+\])+/);

                                console.log(slices);
                                var j = 0;
                                slices.forEach(function (slice) {
                                    if (slice) {
                                        if (slice.indexOf('[') === 0) {
                                            // is a token
                                            var choices = [];
                                            var x = 0;
                                            answer.options[j].forEach(function (opt) {
                                                choices.push({
                                                    string: opt,
                                                    isCorrect: x === answer.correctAnswers[j]
                                                });
                                                ++x;
                                            });
                                            $scope.mcqs[i].push({
                                                type: 'choice',
                                                choices: choices
                                            });
                                            ++j;
                                        } else {
                                            // is a string
                                            $scope.mcqs[i].push({
                                                type: 'text',
                                                string: slice
                                            });
                                        }
                                    }
                                });

                            }
                            ++i;
                        });
                    if (callback) {
                        callback();
                    }
                    if (showToast) {
                        $scope.showSimpleToast('Challenge updated successfully!');
                    }
                }, function (error) {
                    if (callback) {
                        callback();
                    }
                    if (showToast) {
                        $scope.showSimpleToast('An error occurred, please try again!');
                    }
                });
        };

        queryChallenge();

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
        $scope.addOptions = function () {
            $scope.addToList('mcqs', []);
        };

        function showDialog($event, options, option) {
            var parentEl = angular.element(document.body);

            function DialogController($scope, $mdDialog, opts, opt) {
                $scope.opt = opt;

                $scope.shouldAdd = function () {
                    if (opt.choices.length > 0) {
                        for (var i = 0; i < opt.choices.length; ++i) {
                            if (opt.choices[i].string.length === 0) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                };

                $scope.addChoices = function () {
                    if ($scope.shouldAdd()) {
                        opts.push(opt);
                    }
                    $scope.closeDialog();
                };
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.removeChoice = function (choice) {
                    var index = opt.choices.indexOf(choice);
                    if (index > -1) {
                        opt.choices.splice(index, 1);
                    }
                };
                $scope.addChoice = function () {
                    opt.choices.push({
                        string: '',
                        isCorrect: opt.choices.length === 0
                    });
                };
                $scope.checkCorrect = function (opt, choice) {
                    if (choice.isCorrect) {
                        opt.choices.forEach(function (elem) {
                            if (elem !== choice) {
                                elem.isCorrect = false;
                            }
                        });
                    }
                };
            }

            $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    templateUrl: 'modules/core/views/edit-ftb.client.add.option.dialog.html',

                    locals: {
                        opts: options,
                        opt: option
                    },
                    controller: DialogController
                }
            );
        }

        $scope.addOption = function (options, index, event) {
            if (index === 0) {
                options.push({
                    type: 'text',
                    string: ''
                });
            } else {
                var option = {
                    type: 'choice',
                    choices: []
                };

                showDialog(event, options, option);
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

'use strict';


angular.module('core').controller('ChallengesEditMcqController', [
    '$scope', 'Challenges', '$location',
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
            $scope.mcqs.forEach(function (question) {

                $scope.challenge.challengeFile.textControl.answers.
                    push(question.string);
                if (question.isCorrect) {
                    $scope.challenge.challengeFile.textControl.correctAnswer = j;
                }
                ++j;
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
                updateCurrentChallengeModel(callback, showToast);
            }).error(function (err) {
                console.log('Hints error!', err);
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
                addHintFiles(callback, showToast);
            }).error(function (err) {
                console.log('Uplaod error!', err);
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

'use strict';


angular.module('core').controller('ChallengesEditMicqController', ['$scope', 'Challenges', '$location',
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
            queryChallenge(callback, showToast);
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
                if($scope.challenge.challengeFile.textControl.answers.length === 4) {
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
                updateCurrentChallengeModel(callback, showToast);
            }).error(function (err) {
                console.log('Hints error!', err);
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
                addHintFiles(callback, showToast);
            }).error(function (err) {
                console.log('Uploads error!', err);
                addHintFiles(callback, showToast);
            });
        };


        //-----------------------------


        var thisFiles = $scope.files;
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
                    console.log('Error retrieving challenge', error);

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

            offsetX = (targetWidth - width) * 0.5;
            offsetY = (targetHeight - height) * 0.5;

            canvasW = width;
            canvasH = height;

            ctx.drawImage(imageObj, offsetX, offsetY, width, height);

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

'use strict';


angular.module('core').controller('CoursesController', ['$rootScope', '$scope', 'Courses', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($rootScope, $scope, Courses, $location, $mdDialog, QueryParams, $http, sharedProperties) {
        // ChallengesController controller logic
        // ...

        var go = function (course) {
            sharedProperties.setCourse(course);
            $rootScope.course = course;
            $location.path('/challenges/' + course._id);
        };

        function showDialog($event) {
            var parentEl = angular.element(document.body);

            function DialogController($scope, $mdDialog, course) {
                $scope.course = course;

                $scope.closeDialog = function () {
                    $mdDialog.hide();
                };
                $scope.addCourse = function () {
                    $scope.course.$save(function (err) {
                        $scope.closeDialog();
                        go($scope.course);
                    });
                };
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'modules/core/views/course.add.dialog.html',

                locals: {
                    course: $scope.course,
                },
                controller: DialogController
            });
        }

        $scope.showDialog = showDialog;


        function updateCourses() {
            $scope.courses = Courses.get(function () {
            });
        }

        updateCourses();

        $scope.course = new Courses();
        $scope.course.difficulty = 'EASY';
        $scope.go = go;
    }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$location', 'Authentication',
    'Menus', '$timeout', '$mdSidenav', '$mdUtil', '$log', 'Courses', 'Challenges',
    function ($rootScope, $scope, $location, Authentication, Menus, $timeout, $mdSidenav, $mdUtil, $log, Courses, Challenges) {
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.value = 'Cytopathology Challenge';

        var setupChallenge = function(challengeId, callback) {
            Challenges.query({id: challengeId}).
                $promise.then(function (res) {
                    $scope.challenge = res;
                    if(callback) {
                        callback();
                    }
                }, function (error) {
                    console.error('Error retrieving challenge', error);
                }
            );
        };

        var setupCourse = function(courseId, callback) {
            Courses.query({id: courseId}).
                $promise.then(function (res) {
                    $scope.course = res;
                    if(callback) {
                        callback();
                    }
                }, function (error) {
                    console.error('Error retrieving course', error);
                }
            );
        };

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (!toParams) {
                $scope.challenge = null;
                $scope.course = null;
                return;
            }
            if (toParams.courseId) {
                $scope.challenge = null;
                setupCourse(toParams.courseId);
            } else if (toParams.challengeId) {
                setupChallenge(toParams.challengeId, function() {
                    setupCourse($scope.challenge._course);
                });
            } else {
                $scope.challenge = null;
                $scope.course = null;
            }
        });

        $scope.goCourse = function () {
            $location.path('/challenges/' + $scope.course._id);
        };

        $scope.goChallenge = function () {
            var challenge = $scope.challenge;
            $location.path('/challenges/edit/' + challenge._id + '/' + challenge.type);
        };

        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });

        $scope.go = function (path) {
            $location.path(path);
        };
        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildToggler(navID) {
            var debounceFn = $mdUtil.debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug('toggle ' + navID + ' is done');
                    });
            }, 300);
            return debounceFn;
        }

        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');
    }
])
    .controller('LeftCtrl', ["$scope", "$timeout", "$mdSidenav", "$log", function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('left').close()
                .then(function () {
                    $log.debug('close LEFT is done');
                });
        };
    }])
    .controller('RightCtrl', ["$scope", "$timeout", "$mdSidenav", "$log", function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('right').close()
                .then(function () {
                    $log.debug('close RIGHT is done');
                });
        };
    }]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$location',
	function($scope, Authentication, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.go = function (path) {
			$location.path(path);
		};
	}                                              
]);

'use strict';

angular.module('core')
    .service('sharedProperties', function () {
        var currentChallenge = {};

        return {
            getChallenge: function () {
                return currentChallenge;
            },
            setChallenge: function (value) {
                currentChallenge = value;
            },
            getCourse: function () {
                return currentChallenge;
            },
            setCourse: function (value) {
                currentChallenge = value;
            }
        };
    }).factory('Challenges', ['$resource',
        function ($resource) {
            return $resource('/challenges/:id', {
                id: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {method: 'GET', isArray: false},

                get: {method: 'GET', isArray: true}
            });
        }
    ]).factory('Courses', ['$resource',
        function ($resource) {
            return $resource('/courses/:id', {
                id: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                query: {method: 'GET', isArray: false},

                get: {method: 'GET', isArray: true}
            });
        }
    ]).factory('QueryParams', [
        function () {

            return {
                getChallengeId: function () {
                    var result = window.location.hash.substr(19, 24);

                    return result;
                },
                getCourseId: function () {
                    var result = window.location.hash.substr(14, 24);

                    return result;
                }
            };
        }
    ]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, icon, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender,
                icon: icon
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Configure unauthorized behaviour
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('socialAccounts', {
			url: '/settings/accounts/social',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
        state('editAccountsAdmin', {
			url: '/settings/accounts/:userId/edit/admin',
			templateUrl: 'modules/users/views/settings/edit-profile-admin.client.view.html'
		}).
        state('listAccounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/manage-user-accounts.client.view.html'
		}).
        state('createAccounts', {
			url: '/settings/accounts/create',
			templateUrl: 'modules/users/views/settings/create-user-accounts.client.view.html'
		}).
        state('resetAccounts', {
			url: '/settings/accounts/reset/:userId',
			templateUrl: 'modules/users/views/settings/reset-user-accounts.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			if(!$scope.credentials) {
				$scope.error = 'Please insert the required information.';
				return;
			}
			if(!$scope.credentials.password || !$scope.credentials.password2) {
				$scope.error = 'Password field required.';
				return;
			}
			if($scope.credentials.password !== $scope.credentials.password2) {
				$scope.error = 'Passwords must coincide.';
				return;
			}
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/courses');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$window', '$stateParams', '$http', '$location', 'Users', 'Authentication', '$mdDialog',
	function($scope, $window, $stateParams, $http, $location, Users, Authentication, $mdDialog) {
		$scope.user = Authentication.user;
        
        $scope.go = function (path) {
            $location.path(path);
        };

		// If user is not signed in then redirect back home.
		if (!$scope.user) $location.path('/signin');
        // If user has force change password then redirect to change password.
        if ($scope.user.forcePasswordChange===true) $location.path('/settings/password');
        
        $scope.pageSize = 10; //for the paging of users.
        $scope.sortType = 'username'; //default sort type.
        $scope.sortReverse = false; // default sort order.
        $scope.selectedRow = ''; //default to no selected row.
        //function to set the selected row id.
        $scope.setSelectedRow = function (selectedRow) {
            if ($scope.selectedRow!==selectedRow) {
                $scope.selectedRow = selectedRow;
            } else {
                $scope.selectedRow = undefined;
            }
            //console.log(selectedRow._id);
        };
        
        //get list of users.
        $scope.find = function() {
			$scope.users = Users.user.query();
            //console.log($scope.users);
		};
        
        //watching for profile of user being edited.
        $scope.$watchCollection('updateUser', function(newValue) {
            if (newValue!==undefined) {
                $scope.selectedRow = newValue[0];
            }
        });
        
        //get single user for editing.
        $scope.findOne = function() {
			$scope.updateUser = Users.user.query({
                userId: $stateParams.userId
            });
		};
        
        //create new user account - stolen from default signup method.
        $scope.createAccount = function() {
            $scope.success = $scope.error = null;
			$http.post('/auth/create', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				//$scope.authentication.user = response;
                
				// And redirect to the index page
                $scope.success = true;
				$location.path('/settings/accounts');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
        
        // Reset a users password.
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;
            var user = $scope.selectedRow;
            
			$http.post('/settings/accounts/reset/' + user._id, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// And redirect to the index page
				$location.path('/settings/accounts');
			}).error(function(response) {
				$scope.error = response.message;
			});
            
		};
        
        //delete a user account.
        $scope.remove = function(user) {
            var removeUserAccount = user;
            //console.log(username);
            
            var confirm = $mdDialog.confirm()
              .parent(angular.element(document.body))
              .title('Would you like to delete ' + user.username + '?')
              .content('Confirm you wish to carry out this operation')
              .ariaLabel('Delete')
              .ok('Please do it!')
              .cancel('No my mistake');
            $mdDialog.show(confirm).then(function() {
                removeUserAccount.$remove(function() {
                    $location.path('/settings/accounts');
                    for (var i in $scope.users) {
                       if ($scope.users[i] === removeUserAccount) {
                          $scope.users.splice(i, 1);
                       }
                    }
                });
            }, function() {
                $scope.alert = 'You decided to keep ' + user.username;
            });
        };
        
        // Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users.updateUser($scope.selectedRow);

				user.$update(function(response) {
					$scope.success = true;
					$location.path('/settings/accounts');
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};
        
        // Update a user profile
		$scope.update = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users.profile($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
                Authentication.user = response.user;
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
                $location.path('/pilots');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return { 
            profile: $resource('users', {}, { update: { method: 'PUT' }}),
            user: $resource('settings/accounts/:userId', { userId: '@_id' }, { update: { method: 'PUT'}}),
            updateUser: $resource('/settings/accounts/edit/admin/:userId', { userId: '@_id' }, { update: { method: 'POST'}})
        };
	}
]);