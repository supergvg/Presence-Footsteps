angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {
            'use strict';

            $scope.data = {
                selectedIndex: 2
            };

            $scope.glmOptions = {
                showManual: false
            }

            $scope.event = $scope.event || {
                title: 'fake'
            };

            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || (field.$touched && field.$error.required);
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
                eventsService.createEvent($scope.event).then(
                    function (res) {
                        dialogService.success('Event created: ' + JSON.stringify(res));

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    }
                )
            };

        }]);
