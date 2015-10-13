'use strict';

angular.module('gliist')
    .controller('AddGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
        function ($scope, $stateParams, dialogService, $state, eventsService) {

            $scope.goBackToEvent = function (glist) {
                var eventId = $stateParams.eventId,
                    instanceType = $stateParams.instanceType;

                eventsService.linkGuestList([glist], eventId, instanceType).then(
                    function (guestListInstances) {
                        //$scope.event.guestLists = guestListInstances;
                        dialogService.success('Guest lists were linked');
                        $state.go('main.edit_event', {eventId: eventId, view: 3});
                    }, function () {
                        dialogService.error('There was a problem linking, please try again');
                    }
                );

            };

            $scope.init = function () {

                $scope.currentGlist = {
                    title: 'New Guest List',
                    guests: []

                };
            };

            $scope.init();

        }]);
