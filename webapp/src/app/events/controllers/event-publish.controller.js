'use strict';

angular.module('gliist')
    .controller('EventPublishCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$mdDialog',
        function ($scope, $stateParams, dialogService, $state, eventsService, $mdDialog) {

            $scope.toPublish = [];

            $scope.publishEvent = function(ev) {
                if ($scope.checkGuestsEmail()) {
                    dialogService.error('Some guests\' email address are missing, please provide that');
                } else {
                    // Appending dialog to document.body to cover sidenav in docs app
                    var confirm = $mdDialog.confirm()
                        .content('Are you sure you want to send<br><b>confirmation emails/RSVP invitations</b><br>to the selected guest lists?')
                        .ariaLabel('Lucky day')
                        .ok('Yes')
                        .cancel('Cancel')
                        .targetEvent(ev);
                    confirm._options.template = '<md-dialog md-theme="{{ dialog.theme }}" aria-label="{{ dialog.ariaLabel }}"><md-dialog-content role="document" tabIndex="-1"><h2 class="md-title">{{ dialog.title }}</h2><p ng-bind-html="dialog.content" style="font-size: 20px; text-align: center;"></p></md-dialog-content><div class="md-actions"><md-button ng-if="dialog.$type == \'confirm\'" ng-click="dialog.abort()" class="md-primary">{{ dialog.cancel }}</md-button><md-button ng-click="dialog.hide()" class="md-primary">{{ dialog.ok }}</md-button></div></md-dialog>';
                    $mdDialog.show(confirm).then(function() {
                        eventsService.publishEvent($scope.toPublish, $scope.event.id).then(
                            function() {
                                $state.go('main.email_stats', {eventId: $scope.event.id});
                            },
                            function(err) {
                                dialogService.error(err);
                            }
                        );
                    });
                }
            };
            
            $scope.checkGuestsEmail = function() {
                var error = false;
                angular.forEach($scope.event.guestLists, function(gl) {
                    if ($scope.toPublish.indexOf(gl.id) >= 0) {
                        angular.forEach(gl.actual, function(guest){
                            if (!guest.guest.email) {
                                error = true;
                                return;
                            }
                        });
                    }
                    if (error) {
                        return;
                    }
                });
                return error;
            };

            $scope.editEvent = function () {
                $state.go('main.edit_event', {eventId: $scope.event.id});
            };

            $scope.getEventInvite = function (height) {
                return {
                    'background-image': 'url(' + $scope.event.invitePicture + ')',
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-repeat': 'no-repeat',
                    'background-size': 'contain'
                };
            };
            $scope.glOptions = {
                readOnly: true,
                publish: true
            };

            $scope.event = {id: 0};

            $scope.init = function () {
                var eventId = $scope.eventId;

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
                );
            };

            $scope.init();
        }
    ]);