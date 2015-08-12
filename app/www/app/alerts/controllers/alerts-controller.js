angular.module('starter').controller('alertsController', ['$scope', '$rootScope', 'eventsService', 'dialogService', '$cordovaPush',
    function ($scope, $rootScope, eventsService, dialogService, $cordovaPush) {


        $scope.currentUser = $rootScope.currentUser;


        $scope.doAlertsRefresh = function () {
            $scope.init(true);
        };

        $scope.twitterTime = function (alert) {
            return moment(alert.time).twitterShort();
        };

        $scope.init = function (disableSpinner) {

            $scope.fecthingData = !disableSpinner && true;

            eventsService.getNotifications().then(
                function (alerts) {
                    $scope.alerts = alerts;
                },
                function () {
                    $scope.alerts = [];
                }
            ).finally(
                function () {
                    $scope.$broadcast('scroll.refreshComplete', function () {

                    });
                    $scope.fecthingData = false;
                }
            );
        };

        $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
            $scope.doAlertsRefresh();
        });

    }

]);
