'use strict';

angular.module('gliist')
    .controller('EventsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {
            $scope.data = {
                selectedIndex: 2
            };

            $scope.currentEvent = {
                title: 'fake'
            };

            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };

            $scope.showEventDialog = function (ev) {
                $mdDialog.show({
                    //controller: DialogController,
                    templateUrl: 'app/templates/events/event-dialog.tmpl.html',
                    targetEvent: ev
                })
                    .then(function (answer) {
                        $scope.alert = 'You said the information was "' + answer + '".';
                    }, function () {
                        $scope.alert = 'You cancelled the dialog';
                    });
            };

            $scope.next = function (form) {
                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }

                $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
            };
            $scope.previous = function () {
                $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
            };


            $scope.createEvent = function () {
                eventsService.createEvent($scope.currentEvent).then(
                    function (res) {
                        dialogService.success('Event created: ' + JSON.stringify(res));

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    }
                )
            };

            $scope.init = function () {
                $scope.currentEvents = eventsService.getEvents().then(function (data) {
                    $scope.currentEvents = data;
                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');
                })
            };

            $scope.init();
        }]);
