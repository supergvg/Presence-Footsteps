'use strict';

angular.module('gliist')
    .controller('AddGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
        function ($scope, $stateParams, dialogService, $state, eventsService) {
            $scope.goBackToEvent = function (glist, autoSave) {
                if (!autoSave) {
                    $state.go('main.edit_event', {eventId: $stateParams.eventId, view: 3});
                }
            };
            
            $scope.linkToEvent = function (glist) {
                var p = eventsService.linkGuestList([glist], $stateParams.eventId, $stateParams.instanceType);
                p.then(
                    function() {
                        dialogService.success('Guest lists were linked');
                    }, function () {
                        dialogService.error('There was a problem linking, please try again');
                    }
                );
                
                return p;
            };

            $scope.init = function () {

                $scope.currentGlist = {
                    title: 'New Guest List',
                    guests: []

                };
            };

            $scope.init();

        }]);
