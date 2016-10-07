'use strict';

function EventsController ($scope, $filter, facebookService) {
  $scope.$on('facebookEventImport', function (e, event) {
    $scope.importFacebookEvent(event);
  });

  $scope.formatDate = function (date) {
    // Transform timezone offset from +0200 to +02:00
    return date && $filter('date')(date, 'yyyy-MM-ddTHH:mm:ssZ').replace(/(\d{2})$/, ':$1');
  };

  $scope.importFacebookEvent = function (event) {
    $scope.facebookEvent = event;
    $scope.currentEvent = {
      title: event.title,
      time: $scope.formatDate(event.startDate),
      endTime: $scope.formatDate(event.endDate),
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
  'facebookService'
];

angular.module('gliist').controller('EventsCtrl', EventsController);
