angular.module('starter').controller('EventsListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {

        $scope.doEventsRefresh = function () {
            eventsService.getEvents().then(function (data) {
                    $scope.events = data;
                },
                function (err) {
                    dialogService.error(err);
                }
            ).finally(function () {
                    $scope.$broadcast('scroll.refreshComplete', function () {

                    });
                });
        };

        $scope.getEventInvite = function (event) {
            return eventsService.getEventInvite('300px', event.id, $scope.inviteSuffix);
        };

        $scope.init = function () {
            $scope.fecthingData = true;
            eventsService.getEvents().then(function (data) {
                    $scope.events = data;
                },
                function (err) {
                    dialogService.error(err);
                }
            ).finally(function () {
                    $scope.fecthingData = false;
                });

        };
    }
]);
