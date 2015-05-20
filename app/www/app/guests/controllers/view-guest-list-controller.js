angular.module('starter').controller('viewGuestListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$rootScope',

    function ($scope, $stateParams, eventsService, dialogService, $state, $rootScope) {
        $scope.doRefresh = function () {
            var eventId = $stateParams.eventId;
            $scope.guestEntries = [];

            eventsService.getEvents(eventId).then(
                function (event) {
                    $scope.currentEvent = event;
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
                        guest: guest
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
