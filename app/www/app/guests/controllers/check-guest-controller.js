angular.module('starter').controller('checkGuestController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$ionicLoading', '$rootScope',
    function ($scope, $stateParams, eventsService, dialogService, $state, $ionicLoading, $rootScope) {

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

                    $scope.lastCheckin = {
                        guestChecked: $scope.guestChecked,
                        plus: $scope.guestCheckin.plus + ($scope.guestChecked ? 0 : 1)
                    };

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


        $scope.undo = function () {

            $scope.fetchingData = true;
            var undoCheckin = angular.extend({}, $scope.guestCheckin, {plus: $scope.lastCheckin.plus});

            eventsService.undoGuestCheckin(undoCheckin, $scope.guestListInstance).then(
                function (res) {

                    if(res.status === 'no show') {
                        $scope.guestChecked = 0;
                        //res.plus ++;
                    }

                    $scope.maxGuests = res.plus;
                    $scope.guestCheckin = res;



                    $scope.lastCheckin = null;
                },
                function () {
                    dialogService.error('Oops there was a problem getting guest, please try again')
                }
            ).finally(function () {
                    $scope.fetchingData = false;
                });
        };

        $scope.init = function () {

            $ionicLoading.show({
                template: 'Loading...'
            });

            var guestId = $stateParams.guestId,
                gliId = $stateParams.gliId;

            if (!guestId || !gliId) {
                $ionicLoading.hide();
                $state.go('app.home');
                return;
            }

            $scope.guestCheckin = {plus: 0};
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
                    $ionicLoading.hide();
                }
            );
        }
    }
]);
