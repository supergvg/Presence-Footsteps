'use strict';

function EventsController ($scope, facebookService) {
  $scope.$on('facebookEventImport', function (e, event) {
    $scope.importFacebookEvent(event);
  });

  $scope.importFacebookEvent = function (event) {
    $scope.currentEvent = facebookService.parseFacebookEvent(event);
  };
}

EventsController.$inject = [
  '$scope',
  'facebookService'
];

angular.module('gliist').controller('EventsCtrl', EventsController);
