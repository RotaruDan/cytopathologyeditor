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
    });

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
