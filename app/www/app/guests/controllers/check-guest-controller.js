angular.module('starter').controller('checkGuestController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',
    function ($scope, $stateParams, eventsService, dialogService, $state) {
        $scope.init = function () {


            var guestId = $stateParams.guestId,
                gliId = $stateParams.gliId;

            if (!guestId || !gliId) {
                $state.go('app.home');
                return;
            }

            $scope.checkIn = function () {
                eventsService.postGuestCheckin($scope.guestCheckin, $scope.guestListInstance).then(
                    function (res) {
                        $scope.guestCheckin = res;
                    },
                    function () {
                        dialogService.error('Oops there was a problem getting guest, please try again')
                    }
                );
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
            );

        }
    }
]);
