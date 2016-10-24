'use strict';

function AddGuestController ($scope, $mdDialog, guestListParserService, dialogService, eventsService) {
  $scope.data = {
    list: null,
    textGuestList: null
  };

  $scope.close = function() {
    $mdDialog.hide();
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
      $scope.close();
      dialogService.success('Guests were added successfully');
    });
  };
}

AddGuestController.$inject = [
  '$scope',
  '$mdDialog',
  'guestListParserService',
  'dialogService',
  'eventsService'
];

angular.module('gliist').controller('AddGuestController', AddGuestController);
