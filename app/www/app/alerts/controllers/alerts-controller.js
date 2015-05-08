angular.module('starter').controller('alertsController', ['$scope', '$rootScope', 'eventsService', 'dialogService',
    function ($scope, $rootScope, eventsService, dialogService) {


        $rootScope.title = 'Alerts';


        $scope.currentUser = $rootScope.currentUser;


    }

]);
