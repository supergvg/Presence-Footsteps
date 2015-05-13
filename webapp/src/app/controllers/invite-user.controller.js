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

            $scope.hide = function () {
                $scope.user.username = null;
                $scope.user.password = null;
                $scope.user.confirmPassword = null;
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.invite = function () {
                $scope.fetchingData = true;

                userService.sendJoinRequest($scope.user).then(
                    function () {
                        $mdDialog.hide();
                    },
                    function () {
                        dialogService.error('Oops there was a problem loading account info, please try again')
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            };

        }]);
