'use strict';

angular.module('gliist')
    .controller('EmailStatsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', '$state', '$stateParams',
        function ($scope, $mdDialog, eventsService, dialogService, $state, $stateParams) {
            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.initializing = true;
                $scope.selectedForInvite = {};
                $scope.sort = {
                    field: 'firstName',
                    dir: 'asc'
                };

                eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;
                    $scope.guests = [];
                    $scope.changeSort($scope.sort.field);
                    angular.forEach($scope.event.guestLists, function(guestList){
                        angular.forEach(guestList.actual, function(actual){
                            $scope.guests.push(actual.guest);
                        });
                    });
                }, function(){
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(function(){
                    $scope.initializing = false;
                });
                
                $scope.isChecked = function(guest) {
                    return $scope.selectedForInvite[guest.id];
                };
                
                $scope.done = function() {
                    $state.go('main.welcome');
                };
                
                $scope.changeSort = function(field){
                    if ($scope.sort.field === field) {
                        if ($scope.sort.dir === 'asc')
                            $scope.sort.dir = 'desc';
                        else
                            $scope.sort.dir = 'asc';
                    } else {
                        $scope.sort.field = field;
                        $scope.sort.dir = 'asc';
                    }
                };
            };
        }]);
