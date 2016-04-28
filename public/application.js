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
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            //Custom background palette
            .backgroundPalette('light-blue', {
                'default': '50'
            })
            .primaryPalette('blue')
            .accentPalette('light-blue');
    });

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
