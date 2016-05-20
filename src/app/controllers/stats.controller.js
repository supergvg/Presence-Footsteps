'use strict';

angular.module('gliist')
    .controller('StatsCtrl', ['$scope', function ($scope) {
        $scope.options = {
            past: true,
            readyOnly: true,
            stats: true,
            filter: {
                active: true
            }
        };
  }]);