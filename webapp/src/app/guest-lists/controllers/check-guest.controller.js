'use strict';

angular.module('gliist')
  .controller('CheckGuestCtrl', ['$scope', '$stateParams', 'guestFactory', 'dialogService', 'eventsService', '$state', '$window',
    function ($scope, $stateParams, guestFactory, dialogService, eventsService, $state, $window) {


      $scope.subtractGuestCount = function () {
        if ($scope.guestCheckin.plus === 0) {
          return;
        }
        $scope.guestCheckin.plus--;
      };

      $scope.addGuestCount = function () {
        if ($scope.guestCheckin.plus >= $scope.maxGuests) {
          return;
        }
        $scope.guestCheckin.plus++;
      };

      $scope.back = function () {
        $window.history.back();
      };

      $scope.checkIn = function () {
        $scope.checkingGuest = true;
        eventsService.postGuestCheckin($scope.guestCheckin, $scope.guestListInstance).then(
          function (res) {
            $scope.maxGuests = res.plus;
            $scope.guestCheckin = res;
            $scope.guestChecked = 1;
          },
          function (err) {
            if(err) {
              dialogService.error(err.ExceptionMessage);
            }else{
              dialogService.error('Oops there was a problem getting guest, please try again');
            }
          }
        ).finally(function () {
            $scope.checkingGuest = false;
        });
      };
      
      $scope.undoCheckIn = function() {
        $scope.checkingGuest = true;
        eventsService.postGuestUndoCheckin($scope.guestCheckin, $scope.guestListInstance).then(
          function (res) {
            $scope.maxGuests = res.plus;
            $scope.guestCheckin = res;
            $scope.guestChecked = 0;
          },
          function (err) {
            if(err) {
              dialogService.error(err.ExceptionMessage);
            }else{
              dialogService.error('Oops there was a problem getting guest, please try again');
            }
          }
        ).finally(function () {
            $scope.checkingGuest = false;
        });
      };

      $scope.isCheckinDisabled = function () {
        if (!$scope.guestChecked) {
          return false;
        }

        return (!$scope.maxGuests || (!$scope.guestCheckin.plus && $scope.guestChecked));
      };

      $scope.isNotChecked = function(guestCheckin) {
        if (!$scope.guestChecked) {
          return 1;
        }
      };


      $scope.init = function () {
        var guestId = $stateParams.guestId,
          gliId = $stateParams.gliId;

        if (!guestId || !gliId) {
          $state.go('main.welcome');
          return;
        }


        $scope.fetchingData = true;
        eventsService.getGuestCheckin(guestId, gliId).then(
          function (res) {

            $scope.guestCheckin = res.checkin;

            $scope.maxGuests = $scope.guestCheckin.plus;

            if ($scope.guestCheckin.status === 'checked in') {
              $scope.guestChecked = 1;
            }


            $scope.guestListInstance = res.gl_instance;
          },
          function () {
            dialogService.error('Oops there was a problem getting guest, please try again');
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        );

      };


    }]);
