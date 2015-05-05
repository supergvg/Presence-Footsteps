angular.module('starter').controller('homeController', ['$scope', '$rootScope', 'eventsService', 'dialogService',
    function ($scope, $rootScope, eventsService, dialogService) {
        $rootScope.title = 'Events';


        $scope.currentUser = $rootScope.currentUser;


    }

]);
