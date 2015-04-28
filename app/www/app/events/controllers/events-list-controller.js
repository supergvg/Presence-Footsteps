angular.module('starter').controller('EventsListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {


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
