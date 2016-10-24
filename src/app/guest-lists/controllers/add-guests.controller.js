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
    var textGuestList = $scope.data.textGuestList;
    var listId = $scope.data.list;
    if (!textGuestList || !listId) {
      return;
    }

    var guests = guestListParserService.parse(textGuestList);
    if (guests === null) {
      return dialogService.error('No guests found in the list');
    }
    if (typeof guests === 'string') {
      return dialogService.error(guests);
    }

    eventsService.addGuestsToEvent(guests, $scope.event.id, listId).then(function (newGuests) {
      $scope.$emit('guestsAdded');
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
