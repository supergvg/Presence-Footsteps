'use strict';

angular.module('gliist')
    .controller('EventsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {


            $scope.currentEvent = {
                title: '',
                guestLists: []
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                alert('events-controller save');
            };

        }]);
