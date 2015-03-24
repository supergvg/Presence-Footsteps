'use strict';

angular.module('gliist')
    .controller('ProfileCtrl', function ($scope) {


        $scope.currentUser = {name: 'Eran Kaufman'};
        $scope.next = function () {
            $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
        };
        $scope.previous = function () {
            $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
        };
    });
