'use strict';

angular.module('gliist')
    .controller('AddEditGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', 'subscriptionsService',
        function ($scope, $stateParams, dialogService, $state, eventsService, subscriptionsService) {
            $scope.gliId = $stateParams.gli;
            $scope.currentGlist = {
                title: 'New Guest List',
                guests: []
            };
            
            var eventId = $stateParams.eventId,
                instanceType = $stateParams.instanceType,
                eventTotalGuests = 0;
        
            if (eventId) {
                eventsService.getEvents(eventId).then(
                    function(data) {
                        eventTotalGuests = $scope.getTotalGuests(data.guestLists);
                    }, function () {
                        dialogService.error('There was a problem getting your event, please try again');
                    }
                );
            }
            
            $scope.getTotalGuests = function(guestLists) {
                var total = 0;
                angular.forEach(guestLists, function(gl){
                    if ((!$scope.gliId || ($scope.gliId && Number(gl.id) !== Number($scope.gliId))) && angular.isDefined(gl.guestsCount)) {
                        total += gl.guestsCount;
                    }
                });
                return total;
            };    
            
            $scope.checkSubscription = function(glist) {
                var totalGuests = $scope.gliId ? glist.actual.length : glist.guests.length;
                if (!subscriptionsService.verifyFeature('Guests', eventTotalGuests + totalGuests, {}, 'You are only allowed {value} guests, Would you like to upgrade to unlimited?')) {
                    return false;
                }
                return true;
            };
            
            $scope.goBackToEvent = function() {
                $state.go('main.edit_event', {eventId: eventId, view: 3});
            };
            
            
            $scope.goBackToEvent = function(glist) {
                if ($scope.gliId) {
                    $state.go('main.edit_event', {eventId: eventId, view: 3});
                } else {
                    eventsService.linkGuestList([glist], eventId, instanceType).then(
                        function() {
                            dialogService.success('Guest lists were linked');
                            $state.go('main.edit_event', {eventId: eventId, view: 3});
                        }, function () {
                            dialogService.error('There was a problem linking, please try again');
                        }
                    );
                }
            };
        }]);
