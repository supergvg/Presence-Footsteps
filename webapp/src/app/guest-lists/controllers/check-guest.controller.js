'use strict';

angular.module('gliist')
  .controller('CheckGuestCtrl', ['$scope', '$stateParams', 'guestFactory', 'dialogService', 'eventsService', '$state',
    function ($scope, $stateParams, guestFactory, dialogService, eventsService, $state) {


      $scope.guestPending = function (checkin) {
        if (!checkin) {
          return;
        }
        return (checkin.status === 'no show' || checkin.plus > 0);

      };

      $scope.guestNotChecked = function (checkin) {
        if (!checkin) {
          return;
        }

        if (checkin.status === 'no show') {
          return 1;
        }
      };

      $scope.guestChecked = function (checkin) {
        if (!checkin) {
          return;
        }
        if (checkin.status === 'checked in') {
          return 1;
        }
      }

      $scope.init = function () {
        var guestId = $stateParams.guestId,
          gliId = $stateParams.gliId;

        if (!guestId || !gliId) {
          $state.go('app.home');
          return;
        }


        $scope.initializing = true;
        eventsService.getGuestCheckin(guestId, gliId).then(
          function (res) {
            $scope.guestCheckin = res.checkin;
            $scope.guestListInstance = res.gl_instance;

            $scope.maxCheckin = res.checkin.plus;
            if ($scope.guestNotChecked(res.checkin)) {
              $scope.maxCheckin++;
              $scope.guestCheckin.plus++;
            }
          },
          function () {
            dialogService.error('Oops there was a problem getting guest, please try again')
          }
        ).finally(
          function () {
            $scope.initializing = false;
          }
        );

      };


      $scope.checkGuest = function () {
        var actualCheckin = angular.copy($scope.guestCheckin);
        $scope.fetchingData = true;

        if ($scope.guestNotChecked(actualCheckin) && $scope.guestCheckin.plus === 1) {
          actualCheckin.plus = 0;
        }


        eventsService.postGuestCheckin(actualCheckin, $scope.guestListInstance).then(
          function (res) {
            $scope.guestCheckin = res;
            $scope.maxCheckin = res.plus;

            if (res.plus === 0) {
              //$state.go('main.event_checkin', {eventId: $scope.guestListInstance.event.id})
            }

          },
          function () {
            dialogService.error('Oops there was a problem getting guest, please try again')
          }
        ).finally(function () {
            $scope.fetchingData = false;
          });
      };

    }]);
