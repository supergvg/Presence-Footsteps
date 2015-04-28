angular.module('starter').controller('homeController', ['$scope', '$rootScope', 'eventsService', 'dialogService',
    function ($scope, $rootScope, eventsService, dialogService) {
        $scope.title = 'Login';


        $scope.currentUser = $rootScope.currentUser;


    }

]);
