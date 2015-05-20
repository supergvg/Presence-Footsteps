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
            return {
                'background-image': "url(" + event.invitePicture + ")",
                'background-position': 'center center',
                'height': '100px',
                'background-size': 'cover'
            };
        };

        $scope.init = function () {
            $scope.fecthingData = true;

            var promise;
            if ($scope.options && $scope.options.pastEvents) {
                promise = eventsService.getPastEvents();
            } else {
                promise = eventsService.getCurrentEvents();
            }

            promise.then(function (data) {
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
