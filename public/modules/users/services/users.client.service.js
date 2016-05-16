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