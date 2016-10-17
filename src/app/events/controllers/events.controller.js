'use strict';

function EventsController ($scope, $filter, dateService, facebookService) {
  $scope.$on('facebookEventImport', function (e, event) {
    $scope.importFacebookEvent(event);
  });

  $scope.importFacebookEvent = function (event) {
    $scope.facebookEvent = event;
    $scope.currentEvent = {
      FacebookId: event.id,
      FacebookGuests: event.guests,
      title: event.title,
      time: dateService.utc(event.startDate),
      endTime: dateService.utc(event.endDate),
      location: event.location,
      invitePicture: event.image,
      type: 1,
      rsvpType: 3,
      guestLists: [],
      additionalGuests: 0,
      isRsvpCapacityLimited: false
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
  '$filter',
  'dateService',
  'facebookService'
];

angular.module('gliist').controller('EventsCtrl', EventsController);
