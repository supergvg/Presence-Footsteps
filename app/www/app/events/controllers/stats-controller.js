angular.module('starter').controller('statsController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$rootScope',

    function ($scope, $stateParams, eventsService, dialogService, $state, $rootScope) {
        $rootScope.title = 'Stats';


        $scope.init = function () {

            var eventId = $stateParams.eventId;

            if (!eventId) {
                $state.go('app.home');
                return;
            }
            eventsService.getEvents(eventId).then(
                function (event) {
                    $scope.currentEvent = event;

                    $scope.totalCapacity = 200;
                    $scope.totalActual = 150;

                },
                function () {
                    dialogService.error('Oops there was a problem getting event, please try again')
                }
            );

        };
    }
]);