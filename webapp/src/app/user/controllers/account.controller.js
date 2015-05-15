'use strict';

angular.module('gliist')
    .controller('AccountDetailsCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
        function ($scope, $mdDialog, userService, dialogService, $state) {


            $scope.linkNewAccount = function (ev) {
                var scope = $scope.$new();

                $mdDialog.show({
                    controller: 'InviteUserCtrl',
                    scope: scope,
                    templateUrl: 'app/user/templates/link-account-dialog.html',
                    targetEvent: ev
                });
            };

            $scope.editUser = function () {
                alert('edit user!');
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
