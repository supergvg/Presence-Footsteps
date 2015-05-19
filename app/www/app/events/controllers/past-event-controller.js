angular.module('starter').controller('pastEventController', ['$scope', '$rootScope',

    function ($scope, $rootScope) {
        $rootScope.title = 'Past Events';

        $scope.currentGuest = {};

        $scope.options = {
            pastEvents: true
        }
    }
]);
