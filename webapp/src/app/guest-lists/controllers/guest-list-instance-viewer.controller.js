'use strict';

angular.module('gliist')
    .controller('GuestListInstanceViewerCtrl', ['$scope', 'eventsService', 'dialogService', '$state', 'guestFactory',
        function ($scope, eventsService, dialogService, $state, guestFactory) {

            $scope.editInstance = function (ev, instance) {
                $state.go('main.edit_gl_event', {gli: instance.id});
            };

            $scope.getglistTotal = function (glist) {
                var total = 0;

                angular.forEach(glist.actual,
                    function (guest_info) {
                        total += guest_info.guest.plus + 1;
                    });

                return total;
            };


            $scope.published = [];

            $scope.isPublished = function (glist) {
                return $scope.published.indexOf(glist.id) >= 0;
            };

            $scope.togglePublished = function (glist) {

                var idx = $scope.published.indexOf(glist.id);

                if (idx === -1) {
                    $scope.published.push(glist.id)
                } else {
                    $scope.published.splice(idx, 1);
                }

            };

            $scope.save = function (instance) {

                guestFactory.GuestListInstance.update(instance).$promise.then(
                    function (res) {
                    }, function () {
                    }).finally(function () {
                    })
            };

            $scope.onCapacityChanged = function (instance) {
                $scope.save(instance);
            };

            $scope.getActualGuests = function (gli) {
                var checkedCount = 0;

                if (!$scope.event) {
                    return 0;
                }

                if (gli) {
                    angular.forEach(gli.actual,
                        function (chkn) {
                            if (chkn.status === 'checked in') {
                                checkedCount += chkn.guest.plus + 1 - chkn.plus;
                            }
                        });

                    return checkedCount;
                }

                angular.forEach($scope.event.guestLists,
                    function (gl) {

                        angular.forEach(gl.actual,
                            function (chkn) {
                                if (chkn.status === 'checked in') {
                                    checkedCount += chkn.guest.plus + 1 - chkn.plus;
                                }
                            });
                    }
                );

                return checkedCount;
            };


            $scope.getTotalGuests = function () {

                var total = 0;
                angular.forEach($scope.lists, function (list) {
                    total += $scope.getglistTotal(list);
                });

                return total;
            };

            $scope.getTotalCapacity = function () {

                var total = 0;
                angular.forEach($scope.lists, function (list) {
                    total += list.capacity;
                });

                return total;

            };

            $scope.deleteInstance = function (ev, instance) {

                $scope.fetchingData = true;

                eventsService.deleteGuestList(instance, $scope.event.id).then(
                    function (lists) {
                        $scope.lists = lists;
                    }, function () {
                        dialogService.error('There was a problem removing guest list, please try again');
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            }

        }]);
