angular.module('starter').controller('viewGuestListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$rootScope', '$timeout',

    function ($scope, $stateParams, eventsService, dialogService, $state, $rootScope, $timeout) {


        $scope.isCheckinDisabled = function (guestEntry) {
            return !guestEntry.plusBalance;
        };

        $scope.subtractGuestCount = function (guestCheckin) {
            if (guestCheckin.plusBalance === 0) {
                return;
            }
            guestCheckin.plusBalance--;
        };

        $scope.addGuestCount = function (guestCheckin) {
            if (guestCheckin.plusBalance >= guestCheckin.guest.plus) {
                return;
            }
            guestCheckin.plusBalance++;
        };

        $scope.checkIn = function (guestCheckin) {

            if ($scope.isCheckinDisabled(guestCheckin)) {
                return;
            }

            $scope.checkinSpinnerOn = true;
            eventsService.postGuestCheckin(guestCheckin, guestCheckin.glist).then(
                function (res) {
                    guestCheckin.plusBalance = res.plus;
                },
                function () {
                    dialogService.error('Oops there was a problem checkin guest, please try again')
                }
            ).finally(function () {
                    $scope.checkinSpinnerOn = false;
                });
        };

        $scope.doRefresh = function () {
            var eventId = $stateParams.eventId;
            $scope.guestEntries = [];

            eventsService.getEvents(eventId).then(
                function (event) {

                    $timeout(function () {
                        $scope.currentEvent = event;
                    }, 1000);

                },
                function () {
                    dialogService.error('Oops there was a problem getting event, please try again')
                }
            ).finally(function () {
                });

        };


        $scope.$watch('currentEvent', function (newValue) {
            if (!newValue) {
                return;
            }

            $scope.guestEntries = [];

            angular.forEach($scope.currentEvent.guestLists, function (glist) {
                angular.forEach(glist.actual, function (guest) {

                    $scope.guestEntries.push({
                        idx: $scope.guestEntries.length,
                        glist: {
                            id: glist.id,
                            title: glist.title
                        },
                        plusBalance: guest.plus,
                        plus: guest.plus,
                        guestChecked: guest.status === 'checked in' ? 1 : 0,
                        guest: guest.guest
                    });
                });
            });
        });

        $scope.startNewSection = function (guestEntry) {

            if (guestEntry.idx === 0) {
                return true;
            }

            return $scope.guestEntries[guestEntry.idx].glist.title !== $scope.guestEntries[guestEntry.idx - 1].glist.title
        };

        $scope.initGuestListView = function () {
            var eventId = $stateParams.eventId;

            $scope.fecthingData = true;
            eventsService.getEvents(eventId).then(
                function (event) {
                    $scope.currentEvent = event;
                },
                function () {
                    dialogService.error('Oops there was a problem getting event, please try again')
                }
            ).finally(function () {
                    $scope.fecthingData = false;
                });
        };
    }
]);
