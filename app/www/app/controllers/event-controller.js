angular.module('starter').controller('eventController', ['$scope', '$rootScope', 'eventsService',

    function ($scope, $rootScope, eventsService) {
        $scope.title = 'Event';

        $scope.events = eventsService.getEvents();
        $scope.currentEvent = $scope.events.events[0];

        $scope.guests = eventsService.getGuests($scope.currentEvent.id);

        $scope.currentUser = $rootScope.currentUser;

        $scope.onLoginClicked = function () {
            alert('welcome');
        };
    }

]);
