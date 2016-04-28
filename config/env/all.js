'use strict';

module.exports = {
	app: {
		title: 'Cytopathology Challenge Editor',
		description: 'Cytopathology Challenge Editor using full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'Cytopathology Challenge, Editor, MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'th1sIsAs3cr3t-m3An!',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
                'public/lib/angular-material/angular-material.css',
				'public/lib/lf-ng-md-file-input/dist/lf-ng-md-file-input.css'
			],
			js: [
				'public/lib/angular/angular.js',
                'public/lib/angular-aria/angular-aria.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-material/angular-material.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/lf-ng-md-file-input/dist/lf-ng-md-file-input.js'
			]
		},
		css: [
			'public/modules/**/css/*.css',
            'public/style/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
