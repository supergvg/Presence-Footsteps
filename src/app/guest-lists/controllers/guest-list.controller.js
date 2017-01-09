'use strict';

angular.module('gliist')
  .controller('GuestListCtrl', ['$scope',
    function($scope) {
      $scope.options = {
        sorting: {
          active: true
        },
        display: {
          tip: ''
        }
      };
    }]);
