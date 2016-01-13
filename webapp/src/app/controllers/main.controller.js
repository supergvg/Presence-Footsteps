'use strict';

angular.module('gliist')
  .controller('MainCtrl', ['$scope', '$mdSidenav',
    function ($scope, $mdSidenav) {

      $scope.openLeftMenu = function () {
        $mdSidenav('left').toggle();
      };



    }]);
