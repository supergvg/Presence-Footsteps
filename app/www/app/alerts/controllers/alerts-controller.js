angular.module('starter').controller('alertsController', ['$scope', '$rootScope', 'eventsService', 'dialogService', '$cordovaPush',
    function ($scope, $rootScope, eventsService, dialogService, $cordovaPush) {


        $scope.currentUser = $rootScope.currentUser;


        $scope.doAlertsRefresh = function () {
            alert('refresh!');
        };
        $scope.init = function () {


            //eventsService.getAlerts().then().finally();

            /*$scope.alerts = [
             {
             message: 'alert1',
             time: '1 minute'
             },
             {
             message: 'alert2',
             time: '1 minute'
             },
             {
             message: 'alert3',
             time: '1 minute'
             }
             ];*/

            $scope.alerts = [];

        };

        $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {

            if (notification.badge) {
                $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                    // Success!
                }, function (err) {
                    // An error occurred. Show a message to the user
                });
            }
        });

    }

]);
