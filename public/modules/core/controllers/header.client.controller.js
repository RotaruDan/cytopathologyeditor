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
.controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
        $mdSidenav('left').close()
        .then(function () {
            $log.debug('close LEFT is done');
        });
    };
})
.controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
        $mdSidenav('right').close()
        .then(function () {
            $log.debug('close RIGHT is done');
        });
    };
});