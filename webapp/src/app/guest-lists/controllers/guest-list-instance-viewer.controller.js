'use strict';

angular.module('gliist')
    .controller('GuestListInstanceViewerCtrl', ['$scope', 'eventsService', 'dialogService',
        function ($scope, eventsService, dialogService) {

            $scope.editInstance = function (ev, instance) {
                alert('edit instance!');
            };

            $scope.deleteInstance = function (ev, instance) {

                $scope.fetchingData = true;

                eventsService.deleteGuestList(instance, $scope.event.id).then(
                    function (lists) {
                        $scope.lists = lists;
                    }, function () {
                        dialogService.error('There was a problem removing guest list, please try again');
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            }

        }]);
