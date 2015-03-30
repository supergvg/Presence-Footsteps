'use strict';

angular.module('gliist')
    .controller('EventsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {

            $scope.currentEvent = {
                title: 'fake'
            };

            $scope.showEventDialog = function (ev, event) {

                var scope = $scope.$new();
                scope.currentEvent = event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/templates/events/event-dialog.tmpl.html',
                    targetEvent: ev
                });
            };

            $scope.eran = "eran";
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                alert('save');
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
