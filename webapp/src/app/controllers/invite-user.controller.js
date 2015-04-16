'use strict';

angular.module('gliist')
    .controller('InviteUserCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
        function ($scope, $mdDialog, userService, dialogService, $state) {

            $scope.createUser = {};

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

            $scope.hide = function () {
                $scope.createUser.username = null;
                $scope.createUser.password = null;
                $scope.createUser.confirmPassword = null;
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.invite = function () {
                $scope.fetchingData = true;
                alert('not implement');
                $mdDialog.hide();
            };

        }]);
