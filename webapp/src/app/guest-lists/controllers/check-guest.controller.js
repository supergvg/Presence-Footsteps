'use strict';

angular.module('gliist')
    .controller('CheckGuestCtrl', ['$scope', '$stateParams', 'guestFactory', 'dialogService', 'eventsService', '$state',
        function ($scope, $stateParams, guestFactory, dialogService, eventsService, $state) {


            $scope.subtractGuestCount = function () {
                if ($scope.guestCheckin.plus === 0) {
                    return;
                }
                $scope.guestCheckin.plus--;
            };

            $scope.addGuestCount = function () {
                if ($scope.guestCheckin.plus >= $scope.maxGuests) {
                    return;
                }
                $scope.guestCheckin.plus++;
            };

            $scope.checkIn = function () {
                $scope.fetchingData = true;
                eventsService.postGuestCheckin($scope.guestCheckin, $scope.guestListInstance).then(
                    function (res) {
                        $scope.maxGuests = res.plus;
                        $scope.guestCheckin = res;
                        $scope.guestChecked = 1;

                    },
                    function () {
                        dialogService.error('Oops there was a problem getting guest, please try again')
                    }
                ).finally(function () {
                        $scope.fetchingData = false;
                    });
            };


            $scope.isCheckinDisabled = function () {
                if (!$scope.guestChecked) {
                    return false;
                }

                return ($scope.fetchingData || !$scope.maxGuests || (!$scope.guestCheckin.plus && $scope.guestChecked));
            };

            $scope.isNotChecked = function (guestCheckin) {
                if (!$scope.guestChecked) {
                    return 1
                }
            };


            $scope.init = function () {
                var guestId = $stateParams.guestId,
                    gliId = $stateParams.gliId;

                if (!guestId || !gliId) {
                    $state.go('main.welcome');
                    return;
                }


                $scope.fetchingData = true;
                eventsService.getGuestCheckin(guestId, gliId).then(
                    function (res) {

                        $scope.guestCheckin = res.checkin;

                        $scope.maxGuests = $scope.guestCheckin.plus;

                        if ($scope.guestCheckin.status === 'checked in') {
                            $scope.guestChecked = 1;
                        }


                        $scope.guestListInstance = res.gl_instance;

                    },
                    function () {
                        dialogService.error('Oops there was a problem getting guest, please try again')
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );

            };



        }]);
