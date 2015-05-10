angular.module('starter').controller('checkGuestController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$ionicLoading', '$rootScope',
    function ($scope, $stateParams, eventsService, dialogService, $state, $ionicLoading, $rootScope) {

        $rootScope.title = "Check in Guest";

        $scope.subtractGuestCount = function () {
            if ($scope.guestCheckin.plus === 0) {
                return;
            }
            $scope.guestCheckin.plus--;
        };

        $scope.addGuestCount = function () {
            if ($scope.guestCheckin.plus >= $scope.guestCheckin.guest.plus) {
                return;
            }
            $scope.guestCheckin.plus++;
        };

        $scope.checkIn = function () {
            $scope.fetchingData = true;
            eventsService.postGuestCheckin($scope.guestCheckin, $scope.guestListInstance).then(
                function (res) {
                    $scope.guestCheckin = res;
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
