'use strict';

angular.module('gliist')
  .controller('EmailStatsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', '$state', '$stateParams',
    function ($scope, $mdDialog, eventsService, dialogService, $state, $stateParams) {


      $scope.init = function () {
        var eventId = $stateParams.eventId;

        $scope.initializing = true;

        eventsService.getEvents(eventId).then(function (data) {
          $scope.event = data;

        }, function () {
          dialogService.error('There was a problem getting your events, please try again');
          $state.go('main.current_events');
        }).finally(
          function () {
            $scope.initializing = false;
          }
        )
      };
    }]);
