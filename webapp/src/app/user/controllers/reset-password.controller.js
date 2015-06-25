'use strict';

angular.module('gliist')
  .controller('ResetPasswordCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state', '$stateParams',
    function ($scope, $mdDialog, userService, dialogService, $state, $stateParams) {


      $scope.recoverSent = false;


      $scope.user = {};

      $scope.onResetClicked = function (form) {
        if ($scope.user.password !== $scope.user.confirmPassword) {
          $scope.message = "Password don't match ";
          return;
        }

        $scope.message = '';

        if (form && form.$invalid) {
          $scope.showValidation = true;
          return;
        }

        $scope.fetchingData = true;

        userService.resetPassword({
          token: $scope.token,
          NewPassword: $scope.user.password,
          ConfirmPassword: $scope.user.confirmPassword
        }).then(
          function () {
            $state.go('home');
            dialogService.success('Password Changed');

          }, function (err) {


            if (err) {
              dialogService.error(err.exceptionMessage);
            } else {
              dialogService.error('Oops there was a problem please try again');
            }

          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        );


      };

      $scope.init = function () {

        $scope.token = $stateParams.token;

        if (!$scope.token) {
          $state.go('home');
        }

      };

    }]);
