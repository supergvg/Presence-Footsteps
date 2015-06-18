'use strict';

angular.module('gliist')
  .controller('AccountDetailsCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
    function ($scope, $mdDialog, userService, dialogService, $state) {



      $scope.isStaff = function () {
        return $rootScope.isStaff();
      };

      $scope.isPromoter = function () {
        return $rootScope.isPromoter();
      };


      $scope.linkNewAccount = function (ev) {
        var scope = $scope.$new();

        $mdDialog.show({
          controller: 'InviteUserCtrl',
          scope: scope,
          templateUrl: 'app/user/templates/link-account-dialog.html',
          targetEvent: ev
        });
      };

      $scope.editUser = function (ev, linked_account) {
        var scope = $scope.$new();
        scope.linked_account = linked_account;

        $mdDialog.show({
          controller: 'InviteUserCtrl',
          scope: scope,
          templateUrl: 'app/user/templates/link-account-dialog.html',
          targetEvent: ev
        });

      };


      $scope.refresh = function () {

        $scope.refreshing = true;
        userService.getCompanyInfo().then(
          function (data) {
            $scope.company = data;
          },
          function () {
            dialogService.error('Oops there was a problem loading account info, please try again')
          }
        ).finally(
          function () {
            $scope.refreshing = false;
          }
        );
      };

      $scope.init = function () {
        $scope.initializing = true;
        userService.getCompanyInfo().then(
          function (data) {
            $scope.company = data;
          },
          function () {
            dialogService.error('Oops there was a problem loading account info, please try again')
          }
        ).finally(
          function () {
            $scope.initializing = false;
          }
        );
      };

    }]);
