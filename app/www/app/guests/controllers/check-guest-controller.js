angular.module('starter').controller('checkGuestController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$ionicLoading', '$rootScope',
    function ($scope, $stateParams, eventsService, dialogService, $state, $ionicLoading, $rootScope) {

        $scope.isCheckinDisabled = function () {
            return ($scope.fetchingData || !$scope.maxGuests || (!$scope.guestCheckin.plus && $scope.guestChecked));
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

        $scope.init = function () {

            $ionicLoading.show({
                template: 'Loading...'
            });

            var guestId = $stateParams.guestId,
                gliId = $stateParams.gliId;

            if (!guestId || !gliId) {
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
