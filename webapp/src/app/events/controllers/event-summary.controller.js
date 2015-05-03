'use strict';

angular.module('gliist')
    .controller('EventSummaryCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
        function ($scope, $stateParams, dialogService, $state, eventsService) {


            $scope.getEventInvite = function (height) {
                if (!$scope.event) {
                    return;
                }

                return eventsService.getEventInvite(height, $scope.event.id, $scope.inviteSuffix);
            };
            $scope.glOptions = {
                readOnly: true
            };

            $scope.event = {id: 0};

            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.fetchingData = true;

                $scope.currentEvents = eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;

                    $scope.chips = {
                        tags: [
                            $scope.event.category
                        ],
                        readonly: true
                    };


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
