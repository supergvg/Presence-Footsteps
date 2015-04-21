angular.module('starter').controller('eventController',
    ['$scope', '$rootScope', 'eventsService', '$stateParams', 'dialogService',
        function ($scope, $rootScope, eventsService, $stateParams, dialogService) {
            $scope.title = 'Event';

            $scope.currentUser = $rootScope.currentUser;

            $scope.onLoginClicked = function () {
                alert('welcome');
            };

            $scope.init = function () {

                var eventId = $stateParams.eventId;


                $scope.event = eventsService.getEvents(eventId).then(
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
