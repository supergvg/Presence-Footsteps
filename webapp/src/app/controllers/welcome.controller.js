'use strict';

angular.module('gliist')
  .controller('WelcomeController', ['$scope',
    function ($scope) {

      $scope.options = {
        limit: 3,
        readyOnly: true
      };

    }]);
