'use strict';

angular.module('gliist')
  .controller('InviteUserCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
    function ($scope, $mdDialog, userService, dialogService, $state) {


      $scope.permissions = [
        {
          label: 'Manager',
          desc: 'Complete access to all aspects of the dashboard and app'
        },
        {
          label: 'Staff',
          desc: 'Restricted access'
        },
        {
          label: 'Promoter',
          desc: 'Limited Access'
        }
      ];

      $scope.init = function () {
        $scope.linked_account_in_edit = _.extend({}, $scope.linked_account);

        $scope.selected = [];

        if ($scope.linked_account_in_edit.permissions) {

          if ($scope.linked_account_in_edit.permissions.indexOf('manager') > -1) {
            $scope.selected.push($scope.permissions[0]);
          }
          if ($scope.linked_account_in_edit.permissions.indexOf('staff') > -1) {
            $scope.selected.push($scope.permissions[1]);
          }
          if ($scope.linked_account_in_edit.permissions.indexOf('promoter') > -1) {
            $scope.selected.push($scope.permissions[2]);
          }

        }

      };
      $scope.init();


      $scope.toggleSelected = function (item) {
        $scope.selected = [item];
        return;

        var idx = $scope.selected.indexOf(item);
        if (idx > -1) {
          $scope.selected.splice(idx, 1)
        } else {
          $scope.selected.push(item);
        }
      };


      $scope.isSelected = function (item) {
        return $scope.selected.indexOf(item) > -1;
      };

      $scope.hide = function () {
        $scope.linked_account_in_edit = {};
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };

      $scope.update = function () {

        if (!$scope.linked_account_in_edit.UserName || !$scope.linked_account_in_edit.firstName || !$scope.linked_account_in_edit.lastName) {
          $scope.errorMessage = 'Please Fill All Fields';
          return;
        }

        $scope.errorMessage = null;
        $scope.linked_account_in_edit.permissions = [];
        angular.forEach($scope.selected, function (item) {
          $scope.linked_account_in_edit.permissions.push(item.label);
        });

        $scope.linked_account_in_edit.permissions = $scope.linked_account_in_edit.permissions.join();

        $scope.fetchingData = true;

        userService.updateCompanyUser($scope.linked_account_in_edit).then(
          function () {
            $scope.linked_account = $scope.linked_account_in_edit;
            $scope.refresh();
            $mdDialog.hide();
          },
          function () {
            dialogService.error('Oops there was a problem updating user, please try again')
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        );
      };

      $scope.invite = function () {

        if (!$scope.linked_account_in_edit.UserName || !$scope.linked_account_in_edit.firstName || !$scope.linked_account_in_edit.lastName) {
          $scope.errorMessage = 'Please Fill All Fields';
          return;
        }

        $scope.errorMessage = null;
        $scope.linked_account_in_edit.permissions = [];
        angular.forEach($scope.selected, function (item) {
          $scope.linked_account_in_edit.permissions.push(item.label);
        });
        $scope.linked_account_in_edit.permissions = $scope.linked_account_in_edit.permissions.join();

        $scope.fetchingData = true;

        userService.sendJoinRequest($scope.linked_account_in_edit).then(
          function () {
            $mdDialog.hide();
          },
          function (err) {
            if (err) {
              dialogService.error(err.ExceptionMessage);
            } else {
              dialogService.error('Oops there was a problem sending invite please try again')
            }
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        );
      };

    }]);
