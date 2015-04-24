angular.module('starter').controller('statsController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {
        $scope.title = 'Guest';

        $scope.currentGuest = {};

        $scope.onAdClicked = function () {
            eventsService.addGuetToEvent($scope.currentGuest, $scope.currentEvent.id).then(
                function () {
                    dialogService.success('Guest added');

                },
                function () {
                    dialogService.error('Oops there was a problem adding guest, please try again');
                }
            )
        };

        $scope.init = function () {

            var eventId = $stateParams.eventId;

            if (!eventId) {
                $state.go('app.home');
                return;
            }
            eventsService.getEvents(eventId).then(
                function (event) {
                    $scope.currentEvent = event;

                    if ($scope.currentEvent.guestLists[0]) {
                        $scope.guests = $scope.currentEvent.guestLists[0].guests;
                    }
                },
                function () {
                    dialogService.error('Oops there was a problem getting event, please try again')
                }
            );

        };
    }
]);
