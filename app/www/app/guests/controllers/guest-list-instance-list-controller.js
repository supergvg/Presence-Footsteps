angular.module('starter').controller('guestListInstanceListController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {

        $scope.getTotalGuests = function () {

            if (!$scope.event) {
                return;
            }

            var total = 0;

            angular.forEach($scope.event.guestLists,
                function (gl) {
                    total += gl.actual.length;
                }
            );

            return total;
        };

        $scope.getActualGuests = function () {

            return 0;
        };
    }
]);
