angular.module('starter').controller('guestController', ['$scope', '$rootScope', 'eventsService',

    function ($scope, $rootScope, eventsService) {
        $scope.title = 'Guest';


        $scope.currentGuest = {
            name: 'John Doe',
            status: 'VIP'
        };
    }
]);
