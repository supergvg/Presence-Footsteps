'use strict';

angular.module('gliist')
    .controller('EventPublishCtrl', ['$scope', 'dialogService', '$state', 'eventsService', 'permissionsService',
        function ($scope, dialogService, $state, eventsService, permissionsService) {

            $scope.toPublish = [];

            $scope.publishEvent = function(ev) {
                dialogService.confirm(ev, 'Are you sure you want to send<br><b>confirmation emails/RSVP invitations</b><br>to the selected guest lists?', 'Yes', 'No').then(
                    function() {
                        eventsService.publishEvent($scope.toPublish, $scope.event.id).then(
                            function() {
                                if (permissionsService.isRole('promoter')) {
                                    dialogService.success('Guest list has been published');
                                } else {
                                    $state.go('main.email_stats', {eventId: $scope.event.id});
                                }
                            },
                            function(err) {
                                dialogService.error(err);
                            }
                        );
                    }
                );
            };
            
            $scope.checkGuestLists = function(ev) {
                var glRSVP = [];
                angular.forEach($scope.event.guestLists, function(gl) {
                    if ($scope.toPublish.indexOf(gl.id) >= 0 && gl.instanceType === 2) {
                        glRSVP.push(gl.id);
                    }
                });
                if (glRSVP.length > 0) {
                    eventsService.checkGuestsEmailBeforePublishing({ids: glRSVP, eventId: $scope.event.id}).then(
                        function(data) {
                            if (data.Warnings && data.Warnings.length > 0) {
                                dialogService.error(data.Warnings.join('\n'));
                            } else {
                                $scope.publishEvent(ev);
                            }
                        },
                        function(err) {
                            if (err.Message) {
                                dialogService.error(err.Message);
                            }
                        }
                    );
                } else {
                    $scope.publishEvent(ev);
                }
            };
            
            $scope.editEvent = function () {
                $state.go('main.edit_event', {eventId: $scope.event.id});
            };

            $scope.getEventInvite = function (height) {
                return {
                    'background-image': 'url("' + $scope.event.invitePicture + '")',
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