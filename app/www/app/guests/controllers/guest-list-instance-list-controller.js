angular.module('starter').controller('guestListInstanceListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {

        $scope.categories = [
            'GA',
            'VIP',
            'Guest',
            'Artist',
            'Production',
            'Comp',
            'Others',
            'Super VIP',
            'All Access',
            'Comp'
        ];

        $scope.getCategoryStatus = function (category) {

            var count = 0;
            if (!$scope.event) {
                return;
            }
            angular.forEach($scope.event.guestLists,
                function (gl) {

                    angular.forEach(gl.actual,
                        function (chkn) {

                            if (chkn.status !== 'checked in') {
                                return;
                            }

                            if (chkn.guest.type === category) {
                                count += chkn.guest.plus + 1 - chkn.plus;
                            }
                            else if (gl.listType === category) {
                                count += chkn.guest.plus + 1 - chkn.plus;
                            }

                        });
                }
            );

            return count;
        };

        $scope.getCategoryTotal = function (category) {

            var count = 0;

            if (!$scope.event) {
                return;
            }

            angular.forEach($scope.event.guestLists,
                function (gl) {

                    angular.forEach(gl.actual,
                        function (guest_info) {

                            if (guest_info.guest.type === category) {
                                count += guest_info.guest.plus + 1;
                            }
                            else if (gl.listType === category) {
                                count += guest_info.guest.plus + 1;
                            }

                        });
                }
            );

            return count;
        };

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
                return 'bottom-border-wht';
            }

            return 'no-bottom-border';
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
