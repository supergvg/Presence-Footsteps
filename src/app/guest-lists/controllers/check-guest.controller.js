'use strict';

angular.module('gliist')
    .controller('CheckGuestCtrl', ['$scope', 'dialogService', 'eventsService',
        function ($scope, dialogService, eventsService) {
            $scope.maxGuests = 0;
            $scope.notCheckInGuests = 0;
            $scope.checkInGuests = 0;
            $scope.guestChecked = false;

            var success = function(result) {
                    $scope.guestCheckin = result.data;
                    $scope.initVars();
                },
                error = function(error) {
                    var message = error.Message || 'Guest list is at capacity. No more guests can be checked in under this list.';
                    dialogService.error(message);
                };

            $scope.subtractGuestCount = function () {
                $scope.guestCheckin.plus = $scope.guestCheckin.plus <= 1 ? 1 : $scope.guestCheckin.plus - 1;
            };

            $scope.addGuestCount = function () {
                $scope.guestCheckin.plus = $scope.guestCheckin.plus >= $scope.notCheckInGuests ? $scope.notCheckInGuests : $scope.guestCheckin.plus + 1;
            };

            $scope.checkIn = function () {
                $scope.checkingGuest = true;
                if (!$scope.guestChecked) {
                    $scope.guestCheckin.plus--;
                }
                eventsService.postGuestCheckin($scope.guestCheckin, $scope.guestListInstance).then(success)
                    .finally(function () {
                        $scope.checkingGuest = false;
                    });
            };

            $scope.undoCheckIn = function () {
                $scope.checkingGuest = true;
                eventsService.postGuestUndoCheckin($scope.guestCheckin, $scope.guestListInstance).then(success)
                    .finally(function () {
                        $scope.checkingGuest = false;
                    });
            };
            
            $scope.updateNotes = function() {
                $scope.checkingGuest = true;
                eventsService.updateGuestNotes($scope.guestCheckin.guest.id, $scope.guestCheckin.guest.notes).then(function(){}, error)
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
                if (!$scope.guest) {
                    $scope.close();
                }
                $scope.fetchingData = true;
                eventsService.getGuestCheckin($scope.guest.id, $scope.guest.gliId).then(
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