'use strict';

function EventsController ($scope, facebookService) {
  $scope.$on('facebookEventImport', function (e, event) {
    $scope.importFacebookEvent(event);
  });

  $scope.importFacebookEvent = function (event) {
    $scope.facebookEvent = event;
    $scope.currentEvent = {
      title: event.title
    };
  };

  $scope.syncEvent = function () {
    facebookService.getEventData($scope.facebookEvent.id).then(function (event) {
      $scope.importFacebookEvent(event);
    });
  };
}

EventsController.$inject = [
  '$scope',
  'facebookService'
];

angular.module('gliist').controller('EventsCtrl', EventsController);
