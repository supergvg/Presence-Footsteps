'use strict';

angular.module('gliist')
    .controller('CheckGuestCtrl', ['$scope', '$stateParams', 'guestFactory', 'dialogService', 'eventsService', '$state',
        function ($scope, $stateParams, guestFactory, dialogService, eventsService, $state) {


            $scope.init = function () {
                var guestId = $stateParams.guestId,
                    gliId = $stateParams.gliId;

                if (!guestId || !gliId) {
                    $state.go('app.home');
                    return;
                }


                $scope.initializing = true;
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
                        $scope.initializing = false;
                    }
                );

            };


            $scope.checkGuest = function () {
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

        }]);
