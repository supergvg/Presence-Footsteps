'use strict';

function AddGuestsController ($scope, guestListParserService, dialogService) {
  $scope.onAddGuestsClicked = function() {
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

    //import
    if (!$scope.gli) {
      $scope.gli = {};
    }
    if (!$scope.gli.actual) {
      $scope.gli.actual = [];
    }

    var guestCount = guests.length;
    for (var i = 0; i < guestCount; i ++) {
      $scope.gli.actual.push({
        gl_id: $scope.gli.id,
        status: 'no show',
        guest: guests[i]
      });
    }
    $scope.isDirty = true;

    dialogService.success('Guests were added successfully');
    $scope.onDataChange();
    $scope.data.textGuestList = '';
  };
}

AddGuestsController.$inject = [
  '$scope',
  'guestListParserService',
  'dialogService'
];

angular.module('gliist').controller('AddGuestsController', AddGuestsController);
