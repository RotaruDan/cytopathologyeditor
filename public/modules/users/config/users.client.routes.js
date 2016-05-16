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