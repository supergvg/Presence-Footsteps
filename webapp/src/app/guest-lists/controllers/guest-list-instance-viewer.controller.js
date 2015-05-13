'use strict';

angular.module('gliist')
    .controller('GuestListInstanceViewerCtrl', ['$scope', 'eventsService', 'dialogService', '$state',
        function ($scope, eventsService, dialogService, $state) {

            $scope.editInstance = function (ev, instance) {
                $state.go('main.edit_gl_event', {gli: instance.id});
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
