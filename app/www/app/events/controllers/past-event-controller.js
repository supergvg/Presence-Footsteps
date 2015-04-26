angular.module('starter').controller('pastEventController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {
        $scope.title = 'Guest';

        $scope.currentGuest = {};
    }
]);
