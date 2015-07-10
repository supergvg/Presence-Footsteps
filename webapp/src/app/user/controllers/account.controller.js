'use strict';

angular.module('gliist')
  .controller('AccountDetailsCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state', '$rootScope',
    function ($scope, $mdDialog, userService, dialogService, $state, $rootScope) {


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

      $scope.deleteAccount = function (ev, user) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
          .title('Are you sure you want to delete your account?')
          .content('All data will be lost')
          .ariaLabel('Lucky day')
          .ok('Yes')
          .cancel('No')
          .targetEvent(ev);
        $mdDialog.show(confirm).then(function () {

          userService.deleteUser({userName: $scope.user.UserName}).then(
            function () {
            },
            function (err) {
              dialogService.error(err);
            }
          );

          $rootScope.logout();

        }, function () {
        });
      };


      $scope.deleteUser = function (ev, user) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
          .title('Are you sure you want to publish the user?')
          .content('User data will be lost')
          .ariaLabel('Lucky day')
          .ok('Yes')
          .cancel('No')
          .targetEvent(ev);
        $mdDialog.show(confirm).then(function () {

          userService.deleteUser({userName: user.UserName}).then(
            function () {
              $scope.refresh();
            },
            function (err) {
              dialogService.error(err);
            }
          );

        }, function () {

        });
      };


      $scope.getLinkedUsers = function () {

        if (!$scope.company) {
          return [];
        }

        return _.reject($scope.company.users, function (user) {
          return user.permissions && user.permissions.indexOf('admin') > -1;
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
