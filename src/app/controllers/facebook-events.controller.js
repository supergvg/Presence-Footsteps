'use strict';

function FacebookEventsController ($scope, $rootScope, $state, $mdDialog, facebookService) {
  $scope.fetchingData = true;

  // TODO: store FB user id in session.
  facebookService.login().then(function () {
    facebookService.getUserData().then(function (user) {
      facebookService.getEvents(user.id).then(function (events) {
        $scope.fetchingData = false;
        $scope.events = events;
      });
    });
  });

  $scope.import = function () {
    $mdDialog.hide();
    if ($scope.selectedEvent) {
      $state.go('main.create_event');
      $rootScope.$broadcast('facebookEventImport', $scope.selectedEvent);
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
