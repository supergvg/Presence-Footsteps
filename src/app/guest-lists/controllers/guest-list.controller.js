'use strict';

angular.module('gliist')
  .controller('GuestListCtrl', ['$scope',
    function($scope) {
        $scope.options = {
            'search': true,
            'sorting': true
        };
    }]);
