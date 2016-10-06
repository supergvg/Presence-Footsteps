'use strict';

function FacebookEventsController ($scope, facebookService) {
  $scope.fetchingData = true;

  facebookService.getEvents().then(function (events) {
    $scope.fetchingData = false;
    $scope.events = events;
  });
}

FacebookEventsController.$inject = [
  '$scope',
  'facebookService'
];

angular.module('gliist').controller('FacebookEventsController', FacebookEventsController);
