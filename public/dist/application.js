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
        $mdThemingProvider.theme('default')
            //Custom background palette
            .backgroundPalette('light-blue', {
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
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Home', 'core', 'dropdown', '/', 'home');
		Menus.addMenuItem('topbar', 'Challenges', 'core', 'dropdown', '/challenges', 'arrow_forward');
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
                url: '/',
                templateUrl: 'modules/core/views/home.client.view.html'
            }).
            state('challenges', {
                url: '/challenges',
                templateUrl: 'modules/core/views/challenges.client.view.html'
            }).
            state('editmcq', {
                url: '/challenges/edit/:challengeId/mcq',
                templateUrl: 'modules/core/views/edit-mcq.client.view.html'
            }).
            state('editdnd', {
                url: '/challenges/edit/:challengeId/dnd',
                templateUrl: 'modules/core/views/edit-dnd.client.view.html'
            }).
            state('editmicq', {
                url: '/challenges/edit/:challengeId/micq',
                templateUrl: 'modules/core/views/edit-micq.client.view.html'
            }).
            state('editftb', {
                url: '/challenges/edit/:challengeId/ftb',
                templateUrl: 'modules/core/views/edit-ftb.client.view.html'
            }).
            state('editpolygon', {
                url: '/challenges/edit/:challengeId/polygon',
                templateUrl: 'modules/core/views/edit-polygon.client.view.html'
            });
    }
]);

'use strict';



angular.module('core').controller('ChallengesController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location, $mdDialog, QueryParams, $http, sharedProperties) {
        // ChallengesController controller logic
        // ...
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
                    $scope.challenge.challengeFile = 'test.zip';
                    $scope.challenge.$save(function (err) {
                        $scope.closeDialog();
                        updateChallenges();
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
                };
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                template: '<md-dialog aria-label="Challenge dialog">' +
                '  <md-dialog-content>' +
                '   <md-menu>' +
                '       <md-button aria-label="Challenge type" class="md-raised md-primary" ng-click="openMenu($mdOpenMenu, $event)">' +
                '           Type:{{selectedReadType}}' +
                '       </md-button>' +
                '       <md-menu-content width="4">' +
                '           <md-menu-item ng-repeat="readType in readTypes">' +
                '               <md-button ng-click="chooseType($index)"> {{readType}}' +
                '              </md-button>' +
                '           </md-menu-item>' +
                '       </md-menu-content>' +
                '   </md-menu>' +
                '    <md-input-container>' +
                '       <label>Challenge name</label>' +
                '       <input type="text" ng-model="challenge.name">' +
                '   </md-input-container>' +
                '  </md-dialog-content>' +
                '  <md-dialog-actions>' +
                '    <md-button ng-click="closeDialog()" class="md-primary">' +
                '      Close Dialog' +
                '    </md-button>' +
                '    <md-button ng-click="addChallenge()" class="md-primary">' +
                '     Add Challenge' +
                '    </md-button>' +
                '  </md-dialog-actions>' +
                '</md-dialog>',

                locals: {
                    challenge: $scope.challenge,
                    types: $scope.types,
                    readTypes: $scope.readTypes
                },
                controller: DialogController
            });
        }

        $scope.showDialog = showDialog;

        $scope.types = ['mcq', 'dnd', 'micq', 'ftb', 'polygon'];
        $scope.readTypes = ['Multiple Choice Question', 'Drag And Drop',
                            'Multiple Image Choice Question', 'Fill The Options',
                            'Highlight Image Area'];

        function updateChallenges() {
            $scope.challenges = Challenges.get(function () {
                console.log($scope.challenges[0]);
            });
        }

        updateChallenges();

        $scope.challenge = new Challenges();
        $scope.challenge.type = $scope.types[0];
        $scope.go = function (challenge) {
            sharedProperties.setChallenge(challenge);
            $location.path('/challenges/edit/' + challenge._id + '/' + challenge.type);
        };
    }
]);

'use strict';


angular.module('core').controller('ChallengesEditDndController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {


        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function() {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            var j = 0;

            // Copy into 'answers' the $scope.mcqs added by the user
            if($scope.files && $scope.files.length > 0) {
                if($scope.files[0].lfFileName) {
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
        };

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

                updateCurrentChallengeModel();
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel();
            });
        };


        //-----------------------------


        var imageObj = new Image();
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
                imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
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

'use strict';


angular.module('core').controller('ChallengesEditFtbController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {


        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function() {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            var j = 0;

            // Copy into 'answers' the $scope.mcqs added by the user
            if($scope.files && $scope.files.length > 0) {
                if($scope.files[0].lfFileName) {
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
        };

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

                updateCurrentChallengeModel();
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel();
            });
        };


        //-----------------------------


        var imageObj = new Image();
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
                imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
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

'use strict';


angular.module('core').controller('ChallengesEditMcqController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {


        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function() {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            var j = 0;

            // Copy into 'answers' the $scope.mcqs added by the user
            if($scope.files && $scope.files.length > 0) {
                if($scope.files[0].lfFileName) {
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
        };

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

                updateCurrentChallengeModel();
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel();
            });
        };


        //-----------------------------


        var imageObj = new Image();
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
                imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
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

'use strict';


angular.module('core').controller('ChallengesEditMicqController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {


        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function() {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            var j = 0;

            // Copy into 'answers' the $scope.mcqs added by the user
            if($scope.files && $scope.files.length > 0) {
                if($scope.files[0].lfFileName) {
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
        };

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

                updateCurrentChallengeModel();
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel();
            });
        };


        //-----------------------------


        var imageObj = new Image();
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
                imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
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

'use strict';


angular.module('core').controller('ChallengesEditPolygonController', ['$scope', 'Challenges', '$location',
    '$mdDialog', 'QueryParams', '$http', 'sharedProperties',
    function ($scope, Challenges, $location,
              $mdDialog, QueryParams, $http, sharedProperties) {


        // This 'files' var stores the uploaded images from the widget
        $scope.files = [{
            lfDataUrl: '',
            lfFileName: ''
        }];

        // Stores the 'Options' added by the user
        $scope.mcqs = [];

        var updateCurrentChallengeModel = function() {

            // If the photo was correctly uploaded
            // Upload the challenge JSON Data Model
            var j = 0;

            // Copy into 'answers' the $scope.mcqs added by the user
            if($scope.files && $scope.files.length > 0) {
                if($scope.files[0].lfFileName) {
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
        };

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

                updateCurrentChallengeModel();
            }).error(function (err) {
                console.log('error!!', err);
                updateCurrentChallengeModel();
            });
        };


        //-----------------------------


        var imageObj = new Image();
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
                imageObj.src = 'uploads/' + res._id + '/' + res.challengeFile.imagePath;
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

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', 'Authentication', 'Menus', '$timeout', '$mdSidenav', '$mdUtil', '$log',
	function($scope, $location, Authentication, Menus, $timeout, $mdSidenav, $mdUtil, $log) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
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
          var debounceFn =  $mdUtil.debounce(function(){
                $mdSidenav(navID)
                  .toggle()
                  .then(function () {
                    $log.debug('toggle ' + navID + ' is done');
                  });
              },300);
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


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
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
    ]).factory('QueryParams', [
        function () {

            return {
                getChallengeId: function () {
                    var result = window.location.hash.substr(19, 24);

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
				$location.path('/');
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
                console.log($scope.selectedRow);
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