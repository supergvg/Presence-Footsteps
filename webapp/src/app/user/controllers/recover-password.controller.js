'use strict';

angular.module('gliist')
  .controller('RecoverPasswordCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
    function ($scope, $mdDialog, userService, dialogService, $state) {


      $scope.recoverSent = false;


      $scope.user = {};

      $scope.onRecoverClicked = function (form) {


        if (form && form.$invalid) {
          $scope.showValidation = true;
          return;
        }

        $scope.fetchingData = true;

        userService.sendPasswordRecover($scope.user.email).then(
          function () {
            $scope.recoverSent = true;
            $scope.message = "An email has been sent to your inbox, please check if for further instructions";

          }, function () {
            dialogService.error('Oops there was a problem plese try again');
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        );

      };


    }]);
