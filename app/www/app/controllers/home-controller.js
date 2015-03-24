angular.module('starter').controller('homeController', ['$scope', '$rootScope', 'eventsService', 'dialogService',
    function ($scope, $rootScope, eventsService, dialogService) {
        $scope.title = 'Login';


        $scope.currentUser = $rootScope.currentUser;

        $scope.onLoginClicked = function () {
            alert('welcome');
        };


        $scope.init = function () {
            eventsService.getEvents().then(function (data) {
                    $scope.events = data;
                },
                function (err) {
                    dialogService.error(err);
                }
            );

        };

        $scope.init();
    }

]);
