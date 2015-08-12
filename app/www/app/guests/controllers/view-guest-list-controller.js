angular.module('starter').controller('viewGuestListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$rootScope', '$timeout',

    function ($scope, $stateParams, eventsService, dialogService, $state, $rootScope, $timeout) {


        $scope.filter = {};
        $scope.active = 'newGuests';
        $scope.setActive = function (activeScreen) {
            $scope.active = activeScreen;
        };

        $scope.isActive = function (activeScreen) {
            if ($scope.active === activeScreen) {
                return {
                    'background-color': 'white',
                    'color': '#444'
                }
            }
        };

        $scope.splitGuests = function () {
            $scope.guestEntriesFiltered = [];

            if ($scope.active === 'newGuests') {
                angular.forEach($scope.guestEntries, function (value) {
                    if (!value.guestChecked || value.plusBalance > 0) {
                        $scope.guestEntriesFiltered.push(value);
                    }
                });
            }
            else {
                angular.forEach($scope.guestEntries, function (value) {
                    if (value.guestChecked && value.plusBalance === 0) {
                        $scope.guestEntriesFiltered.push(value);
                    }
                });
            }
        };

        $scope.isNotChecked = function (guestCheckin) {
            if (!guestCheckin.guestChecked) {
                return 1
            }
        };


        $scope.$watch('active', function (newValue) {
            $scope.splitGuests();
        });

        $scope.isCheckinDisabled = function (guestEntry) {
            return !guestEntry.plusBalance;
        };

        $scope.subtractGuestCount = function (guestCheckin) {
            if (guestCheckin.guestChecked && guestCheckin.plus === 1) {
                return;
            }

            if (!guestCheckin.guestChecked && guestCheckin.plus === 0) {
                return;
            }

            guestCheckin.plus--;
        };

        $scope.addGuestCount = function (guestCheckin) {
            var gck = 0;
            if (!guestCheckin.guestChecked) {
                gck = 1;
            }
            if (guestCheckin.plus >= guestCheckin.plusBalance - gck) {
                return;
            }
            guestCheckin.plus++;
        };

        $scope.checkIn = function (guestCheckin) {

            if ($scope.isCheckinDisabled(guestCheckin)) {
                return;
            }

            $scope.checkinSpinnerOn = true;
            eventsService.postGuestCheckin(guestCheckin, guestCheckin.glist).then(
                function (res) {
                    guestCheckin.plusBalance = res.plus;
                    guestCheckin.guestChecked = true;
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
                    dialogService.error('Oops there was a problem, please try again')
                }
            ).finally(function () {
                    $scope.$broadcast('scroll.refreshComplete', function () {

                    });
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
                        plusBalance: guest.plus + (guest.status === 'no show' ? 1 : 0),
                        plus: guest.plus,
                        guestChecked: guest.status === 'checked in' ? 1 : 0,
                        guest: guest.guest
                    });
                });
            });

            $scope.splitGuests();
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
