angular.module('starter').controller('homeController', ['$scope', '$rootScope', 'eventsService', 'dialogService',
    function ($scope, $rootScope, eventsService, dialogService) {

        $scope.currentUser = $rootScope.currentUser;

        $scope.options = {
        };
    }

]);
