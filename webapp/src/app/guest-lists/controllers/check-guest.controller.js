'use strict';

angular.module('gliist')
    .controller('CheckGuestCtrl', ['$scope', '$stateParams', 'guestFactory', 'dialogService', 'eventsService', '$state', '$window',
        function ($scope, $stateParams, guestFactory, dialogService, eventsService, $state, $window) {

            $scope.maxGuests = 0;
            $scope.notCheckInGuests = 0;
            $scope.checkInGuests = 0;
            $scope.guestChecked = false;

            var success = function(result) {
                    $scope.guestCheckin = result;
                    $scope.initVars();
                },
                error = function(error) {
                    if (error) {
                        dialogService.error(error.ExceptionMessage);
                    } else {
                        dialogService.error('Oops there was a problem getting guest, please try again');
                    }
                };

            $scope.subtractGuestCount = function () {
                $scope.guestCheckin.plus = $scope.guestCheckin.plus <= 1 ? 1 : $scope.guestCheckin.plus - 1;
            };

            $scope.addGuestCount = function () {
                $scope.guestCheckin.plus = $scope.guestCheckin.plus >= $scope.notCheckInGuests ? $scope.notCheckInGuests : $scope.guestCheckin.plus + 1;
            };

            $scope.back = function () {
                $window.history.back();
            };

            $scope.checkIn = function () {
                $scope.checkingGuest = true;
                if (!$scope.guestChecked) {
                    $scope.guestCheckin.plus--;
                }
                eventsService.postGuestCheckin($scope.guestCheckin, $scope.guestListInstance).then(success, error)
                    .finally(function () {
                        $scope.checkingGuest = false;
                    });
            };

            $scope.undoCheckIn = function () {
                $scope.checkingGuest = true;
                eventsService.postGuestUndoCheckin($scope.guestCheckin, $scope.guestListInstance).then(success, error)
                    .finally(function () {
                        $scope.checkingGuest = false;
                    });
            };
            
            $scope.initVars = function() {
                $scope.maxGuests = $scope.guestCheckin.guest.plus + 1;
                $scope.guestChecked = $scope.guestCheckin.status === 'checked in';
                $scope.notCheckInGuests = $scope.guestCheckin.plus + !$scope.guestChecked;
                $scope.checkInGuests = $scope.maxGuests - $scope.notCheckInGuests;
                if (!$scope.guestChecked) {
                    $scope.guestCheckin.plus++;
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
                    function(res) {
                        $scope.guestCheckin = res.checkin;
                        $scope.initVars();
                        $scope.guestListInstance = res.gl_instance;
                    },
                    function() {
                        dialogService.error('Oops there was a problem getting guest, please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };
        }]);
