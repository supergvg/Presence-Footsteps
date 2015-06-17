'use strict';

angular.module('gliist')
  .controller('InviteUserCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
    function ($scope, $mdDialog, userService, dialogService, $state) {

      $scope.user = {};

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

      $scope.selected = $scope.selected || [];

      $scope.toggleSelected = function (item) {
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
        $scope.user = {};
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.invite = function () {

        if (!$scope.user.username || !$scope.user.firstName || !$scope.user.lastName) {
          $scope.errorMessage = 'Please Fill All Fields';
          return;
        }

        $scope.errorMessage = null;
        $scope.user.permissions = [];
        angular.forEach($scope.selected, function (item) {
          $scope.user.permissions.push(item.label);
        });
        $scope.user.permissions = $scope.user.permissions.join();

        $scope.fetchingData = true;

        userService.sendJoinRequest($scope.user).then(
          function () {
            $mdDialog.hide();
          },
          function () {
            dialogService.error('Oops there was a problem sending invite please try again')
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        );
      };

    }]);
