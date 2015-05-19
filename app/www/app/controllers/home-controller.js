angular.module('starter').controller('homeController', ['$scope', '$rootScope', 'eventsService', 'dialogService',
    function ($scope, $rootScope, eventsService, dialogService) {


        $scope.init = function () {
            $rootScope.title = 'Events';
        };


        $scope.currentUser = $rootScope.currentUser;

        $scope.options = {
        };
    }

]);
