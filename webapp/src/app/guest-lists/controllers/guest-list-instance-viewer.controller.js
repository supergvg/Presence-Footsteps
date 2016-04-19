'use strict';

angular.module('gliist')
    .controller('GuestListInstanceViewerCtrl', ['$scope', 'eventsService', 'dialogService', '$state', 'guestFactory', '$rootScope',
        function ($scope, eventsService, dialogService, $state, guestFactory, $rootScope) {
            $scope.published = [];
            $scope.flexWidth = ['30', '20', 'none', '10', 'none', '10', 'none', '10', '10', '5'];
            if ($scope.options.stats || $scope.options.publish) {
                $scope.flexWidth = ['20', '15', 'none', '10', 'none', '10', 'none', '10', '10', '5'];
            }
            
            $scope.isPromoter = function() {
                return $rootScope.isPromoter();
            };

            $scope.isPublished = function(glist) {
                return $scope.published.indexOf(glist.id) >= 0;
            };

            $scope.isShowColumn = function(column) {
                var show = false;
                angular.forEach($scope.lists, function(list){
                    if (list[column]) {
                        show = true;
                        return;
                    }
                });
                return show;
            };
            
            $scope.editInstance = function(ev, instance) {
                $state.go('main.edit_gl_event', {gli: instance.id, eventId: $scope.event.id});
            };

            $scope.deleteInstance = function(ev, instance) {
                $scope.fetchingData = true;
                eventsService.deleteGuestList(instance, $scope.event.id).then(
                    function(lists) {
                        $scope.lists = lists;
                    }, function() {
                        dialogService.error('There was a problem removing guest list, please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $scope.togglePublished = function(glist) {
                var idx = $scope.published.indexOf(glist.id);

                if (idx === -1) {
                    $scope.published.push(glist.id);
                } else {
                    $scope.published.splice(idx, 1);
                }
            };

            $scope.save = function(instance) {
                guestFactory.GuestListInstance.update(instance);
            };

            $scope.onCapacityChanged = function(instance) {
                $scope.save(instance);
            };

            $scope.getActualGuests = function(glist) {
                var totalCheckedIn = 0;
                if (glist) {
                    angular.forEach(glist.actual, function(guest) {
                        if (guest.status === 'checked in') {
                            totalCheckedIn += guest.guest.plus + 1 - guest.plus;
                        }
                    });
                }
                return totalCheckedIn;
            };

            $scope.getTotalGuests = function(glist) {
                var total = 0;
                if (glist) {
                    total = glist.guestsCount;
                }
                return total;
            };
            
            $scope.getUnconfirmedGuests = function(glist) {
                var total = 0;
                if (glist.instanceType === 2) {
                    total = glist.guestsCount;
                    angular.forEach(glist.actual, function(guest) {
                        total -= guest.plus + 1;
                    });
                } else {
                    total = $scope.getTotalGuests(glist) - $scope.getActualGuests(glist);
                }
                return total;
            };

            $scope.getGrandTotalCapacity = function() {
                var total = 0;
                angular.forEach($scope.lists, function(list) {
                    total += list.capacity;
                });
                return total;
            };

            $scope.getGrandTotalGuests = function() {
                var total = 0;
                angular.forEach($scope.lists, function(list) {
                    total += $scope.getTotalGuests(list);
                });
                return total;
            };
            
        }]);
