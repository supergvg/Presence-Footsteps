'use strict';

function FacebookEventsController ($scope, facebookService) {
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
}

FacebookEventsController.$inject = [
  '$scope',
  'facebookService'
];

angular.module('gliist').controller('FacebookEventsController', FacebookEventsController);
