'use strict';

function EditEventController (
  $scope,
  $state,
  $stateParams,
  dialogService,
  eventsService,
  facebookService,
  subscriptionsService
) {
  var eventId = $stateParams.eventId;
  $scope.initializing = true;

  $scope.currentEvents = eventsService.getEvents(eventId).then(
    function(event) {
      $scope.event = event;
    }, function () {
      dialogService.error('There was a problem getting your events, please try again');
      $state.go('main.current_events');
    }
  ).finally(function() {
    $scope.initializing = false;
  });

  $scope.syncEvent = function () {
    facebookService.getEventData($scope.event.FacebookId).then(function (event) {
      var guestsCount = event.guests.length;
      if (guestsCount && !subscriptionsService.verifyFeature('Guests', guestsCount, true)) {
        return;
      }

      $scope.event = facebookService.parseFacebookEvent(event);
    });
  }
}

EditEventController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  'dialogService',
  'eventsService',
  'facebookService',
  'subscriptionsService'
];

angular.module('gliist').controller('EditEventCtrl', EditEventController);
