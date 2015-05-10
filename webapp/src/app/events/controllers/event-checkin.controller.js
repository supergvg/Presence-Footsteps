'use strict';

angular.module('gliist')
    .controller('EventCheckinCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$mdDialog',
        function ($scope, $stateParams, dialogService, $state, eventsService, $mdDialog) {


            $scope.publishEvent = function (ev) {

                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to publish the event?')
                    .content('Invitations will be sent to all guests.')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {

                    eventsService.publishEvent($scope.event.id).then(
                        function () {

                        },
                        function (err) {
                            dialogService.error(err);
                        }
                    );

                }, function () {
                    $scope.alert = 'You decided to keep your debt.';
                });

            };

            $scope.editEvent = function () {
                $state.go("main.edit_event", {eventId: $scope.event.id});
            };

            $scope.getEventInvite = function (height) {
                return {
                    'background-image': "url(" + $scope.event.invitePicture + ")",
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-size': 'cover'
                };
            };
            $scope.glOptions = {
                readOnly: true
            };

            $scope.event = {id: 0};

            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.initializing = true;

                $scope.currentEvents = eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;

                    $scope.chips = {
                        tags: [
                            $scope.event.category
                        ],
                        readonly: true
                    };


                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');

                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.initializing = false;
                    }
                )

            };

            $scope.init();

        }]);
