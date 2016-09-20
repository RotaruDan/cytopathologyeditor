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
