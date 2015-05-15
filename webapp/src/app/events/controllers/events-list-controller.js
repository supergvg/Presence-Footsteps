'use strict';

angular.module('gliist')
    .controller('EventsListCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {

            $scope.getEventInvite = function (event) {
                return {
                    'background-image': "url(" + event.invitePicture + ")",
                    'background-position': 'center center',
                    'height': '120px',
                    'background-size': 'cover'
                };
            };


            $scope.showStats = function (ev, event) {
                var scope = $scope.$new();
                scope.currentEvent = event;

                scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $mdDialog.show({
                    controller: 'EventsStatsCtrl',
                    scope: scope,
                    templateUrl: 'app/templates/events/event-stats-dialog.tmpl.html',
                    targetEvent: ev
                });
            };

            $scope.deleteEvent = function (ev, event) {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    //.parent(angular.element(document.body))
                    .title('Are you sure you want to delete event?')
                    //.content('Confirm ')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {
                    eventsService.deleteEvent(event.id).then(function (data) {
                        $scope.refreshEvents();
                    }, function () {
                        dialogService.error('There was a problem please try again');
                    })


                }, function () {
                    $scope.alert = 'You decided to keep your debt.';
                });
            };


            $scope.refreshEvents = function () {
                $scope.fetchingData = true;
                $scope.currentEvents = eventsService.getEvents().then(function (data) {
                    $scope.currentEvents = data;
                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');
                }).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                )
            };


            $scope.init = function () {
                $scope.refreshEvents();
            };

            $scope.init();
        }]);
