'use strict';

function FacebookEventsController ($scope, $rootScope, $state, $mdDialog, facebookService, subscriptionsService) {
  $scope.fetchingData = true;

  facebookService.getEvents().then(function (events) {
    $scope.fetchingData = false;
    $scope.events = events;
  });

  $scope.close = function() {
    $mdDialog.hide();
  };

  $scope.import = function () {
    if ($scope.selectedEvent) {
      if (!subscriptionsService.verifyFeature('Guests', $scope.selectedEvent.guests.length, true)) {
        return;
      }

      $mdDialog.hide();

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
  'facebookService',
  'subscriptionsService'
];

angular.module('gliist').controller('FacebookEventsController', FacebookEventsController);
