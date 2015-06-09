'use strict';

angular.module('gliist')
  .controller('MainCtrl', ['$scope', '$mdSidenav', '$state',
    function ($scope, $mdSidenav, $state) {

      $scope.openLeftMenu = function () {
        $mdSidenav('left').toggle();
      };



    }]);
