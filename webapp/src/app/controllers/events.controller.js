'use strict';

angular.module('gliist')
    .controller('EventsCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
        $scope.data = {
            selectedIndex: 0
        };

        $scope.currentEvent = {};

        $scope.currentEvents = [
            {
                title: 'event 1',
                photo: 'assets/images/yeoman.png'
            },
            {
                title: 'event 2',
                photo: 'assets/images/yeoman.png'
            },
            {
                title: 'event 3',
                photo: 'assets/images/yeoman.png'
            }
        ];

        $scope.showEventDialog = function (ev) {
            $mdDialog.show({
                //controller: DialogController,
                templateUrl: 'app/templates/events/event-dialog.tmpl.html',
                targetEvent: ev
            })
                .then(function (answer) {
                    $scope.alert = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.alert = 'You cancelled the dialog.';
                });
        };

        $scope.next = function () {
            $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
        };
        $scope.previous = function () {
            $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
        };
    }]);
