'use strict';

angular.module('gliist')
  .controller('WelcomeController', ['$scope', '$mdSidenav', '$state',
    function ($scope, $mdSidenav, $state) {

      $scope.options = {
        limit: 3
      };

    }]);
