angular.module('starter').controller('guestListInstanceListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {

        $scope.getTotalGuests = function (gli) {

            if (!$scope.event) {
                return;
            }

            var total = 0;

            if (gli) {
                angular.forEach(gli.actual,
                    function (guest_info) {
                        total += guest_info.guest.plus + 1;
                    });

                return total;
            }


            angular.forEach($scope.event.guestLists,
                function (gl) {
                    angular.forEach(gl.actual,
                        function (guest_info) {
                            total += guest_info.guest.plus + 1;
                        });
                }
            );

            return total;
        };

        $scope.isLast = function (last) {
            if (!last) {
                return {
                    'border-bottom': 'white !important'
                }
            }

            return {
                'border-bottom': 'transparentgue !important'
            }
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
    }
]);
