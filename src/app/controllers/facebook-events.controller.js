'use strict';

function FacebookEventsController ($scope, $rootScope, $state, $mdDialog, facebookService) {
  $scope.fetchingData = true;

  facebookService.getEvents().then(function (events) {
    $scope.fetchingData = false;
    $scope.events = events;
  });

  $scope.close = function() {
    $mdDialog.hide();
  };

  $scope.import = function () {
    $mdDialog.hide();
    if ($scope.selectedEvent) {
      $state.go('main.create_event').then(function () {
        $rootScope.$broadcast('facebookEventImport', $scope.selectedEvent);
      });
    }
  };
}

FacebookEventsController.$inject = [
  '$scope',
  '$rootScope',
  '$state',
  '$mdDialog',
  'facebookService'
];

angular.module('gliist').controller('FacebookEventsController', FacebookEventsController);
