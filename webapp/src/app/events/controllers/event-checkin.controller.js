'use strict';

angular.module('gliist')
    .controller('EventCheckinCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
        function ($scope, $stateParams, dialogService, $state, eventsService) {


            $scope.checkinGuest = function (checkin) {
                $state.go('main.check_guest', {
                    guestId: checkin.guest.id,
                    gliId: $scope.event.guestLists[0].id
                });
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

            $scope.gridOptions = {
                columnDefs: [
                    { field: 'guest.firstName', name: 'First Name', enableHiding: false},
                    { field: 'guest.lastName', name: 'Last Name', enableHiding: false},
                    { field: 'guest.email', name: 'Email', enableHiding: false },
                    { field: 'guest.phoneNumber', name: 'Phone Number', enableSorting: false, enableHiding: false},
                    { field: 'guest.plus', name: 'Plus', enableSorting: false, enableHiding: false},
                    { name: 'Check in', field: 'guest.id', enableSorting: false, enableHiding: false,
                        cellTemplate: '<div class="ui-grid-cell-contents" title="Checkin">' +
                            '<md-button class="md-primary" ng-click="grid.appScope.checkinGuest(row.entity)">Check In</md-button>' +
                            '</div>'
                    }
                ],
                rowHeight: 35,
                data: []
            };


            $scope.event = {id: 0};

            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.initializing = true;

                eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;


                    angular.forEach($scope.event.guestLists, function (gl) {
                        $scope.gridOptions.data = $scope.gridOptions.data.concat(gl.actual);
                    });


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
