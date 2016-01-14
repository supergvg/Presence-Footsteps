'use strict';

angular.module('gliist')
    .controller('EventSummaryCtrl', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.init = function () {
                $scope.eventId = $stateParams.eventId;
            };
        }]);
