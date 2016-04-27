'use strict';

angular.module('gliist')
    .controller('EditEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
        function ($scope, $stateParams, dialogService, $state, eventsService) {
            var eventId = $stateParams.eventId;
            $scope.initializing = true;
            $scope.currentEvents = eventsService.getEvents(eventId).then(
                function(data) {
                    $scope.event = data;
                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }
            ).finally(function() {
                $scope.initializing = false;
            });
        }]);
