'use strict';

angular.module('gliist')
    .controller('AddGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
        function ($scope, $stateParams, dialogService, $state, eventsService) {
            $scope.listLinked = false;

            $scope.goBackToEvent = function (glist) {
                var eventId = $stateParams.eventId,
                    instanceType = $stateParams.instanceType;
                if (!$scope.listLinked) {
                    eventsService.linkGuestList([glist], eventId, instanceType).then(
                        function(data) {
                            dialogService.success('Guest lists were linked');
                            $scope.listLinked = true;
                        }, function () {
                            dialogService.error('There was a problem linking, please try again');
                        }
                    );
                }
            };

            $scope.init = function () {

                $scope.currentGlist = {
                    title: 'New Guest List',
                    guests: []

                };
            };

            $scope.init();

        }]);
