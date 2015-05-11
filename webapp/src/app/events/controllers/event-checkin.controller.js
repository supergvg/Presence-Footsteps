'use strict';

angular.module('gliist')
    .controller('EventCheckinCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$mdDialog',
        function ($scope, $stateParams, dialogService, $state, eventsService, $mdDialog) {


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
                    { field: 'guest.firstName', name: 'First Name'},
                    { field: 'guest.lastName', name: 'Last Name'},
                    { field: 'guest.email', name: 'Email'},
                    { field: 'guest.phoneNumber', name: 'Phone Number'},
                    { field: 'guest.plus', name: 'Plus' }
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
