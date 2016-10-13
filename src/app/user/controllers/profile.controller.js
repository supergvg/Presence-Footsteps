'use strict';

function ProfileController (
  $scope,
  $rootScope,
  $stateParams,
  $location,
  userService,
  dialogService,
  facebookService
) {
  $scope.selectedIndex = parseInt($stateParams.view) || 0;

  $rootScope.$watch('currentUser', function(newValue) {
    $scope.currentUser = angular.copy(newValue);
  });

  $scope.getSelected = function(idx) {
    return $scope.selectedIndex === idx ? 'active' : '';
  };

  $scope.toIndex = function(index) {
    $location.search('view', index);
  };

  $scope.next = function(ev) {
    if (ev.pointer.type === 't') {
      $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 1);
    }
  };
  $scope.previous = function(ev) {
    if (ev.pointer.type === 't') {
      $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
    }
  };

  $scope.connectFacebook = function () {
    facebookService.connectAccount().then(function () {
      dialogService.success('Facebook account connected');
    });
  };

  $scope.link = function() {
    userService.updateCompanySocialLinks($scope.currentUser).then(function(){
      dialogService.success('Social links saved');
    }, function(data) {
      dialogService.error(data.Message);
    });
  };
}

ProfileController.$inject = [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$location',
  'userService',
  'dialogService',
  'facebookService'
];

angular.module('gliist').controller('ProfileCtrl', ProfileController);
