'use strict';

function AddGuestController ($scope, guestListParserService, dialogService, eventsService) {
  $scope.data = {
    list: null,
    textGuestList: null
  };

  $scope.addGuest = function() {
    if (!$scope.data.textGuestList) {
      return;
    }

    var guests = guestListParserService.parse($scope.data.textGuestList);
    if (guests === null) {
      return dialogService.error('No guests found in the list');
    }
    if (typeof guests === 'string') {
      return dialogService.error(guests);
    }

    eventsService.addGuestsToEvent(guests, $scope.event.id, $scope.data.list).then(function () {
      dialogService.success('Guests were added successfully');
    });
  };
}

AddGuestController.$inject = [
  '$scope',
  'guestListParserService',
  'dialogService',
  'eventsService'
];

angular.module('gliist').controller('AddGuestController', AddGuestController);
