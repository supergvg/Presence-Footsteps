'use strict';

angular.module('gliist')
    .controller('EditEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
        function ($scope, $stateParams, dialogService, $state, eventsService) {

            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.fetchingData = true;

                $scope.currentEvents = eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;
                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');

                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                )

            };

            $scope.init();

        }]);
