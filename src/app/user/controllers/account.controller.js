'use strict';

angular.module('gliist')
    .controller('AccountDetailsCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$rootScope', 'subscriptionsService',
        function ($scope, $mdDialog, userService, dialogService, $rootScope, subscriptionsService) {
            $scope.linkNewAccount = function(ev) {
                if (!subscriptionsService.verifyFeature('Accounts', $scope.getLinkedUsers().length + 2, ev, 'You are not allowed to invite contributors. Would you like to upgrade to unlimited?')) {
                    return;
                }
                var scope = $scope.$new();
                $mdDialog.show({
                    controller: 'InviteUserCtrl',
                    scope: scope,
                    templateUrl: 'app/user/templates/link-account-dialog.html',
                    targetEvent: ev
                });
            };

            $scope.editUser = function(ev, linked_account) {
                var scope = $scope.$new();
                scope.linked_account = linked_account;

                $mdDialog.show({
                    controller: 'InviteUserCtrl',
                    scope: scope,
                    templateUrl: 'app/user/templates/link-account-dialog.html',
                    targetEvent: ev
                });
            };

            $scope.deleteAccount = function(ev) {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to delete your account?')
                    .content('All data will be lost')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function() {
                    userService.deleteCompany({companyId: $scope.user.company_id, userId: $scope.user.userId}).then(
                        function() {
                            $rootScope.logout();
                        },
                        function(error) {
                            var message = error.MessageDetail || 'Oops there was a problem loading account info, please try again';
                            dialogService.error(message);
                        }
                    );
                }, function() {
                });
            };


            $scope.deleteUser = function(ev, user) {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to delete the user?')
                    .content('User data will be lost')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {
                    userService.deleteUser({userId: user.Id}).then(
                        function () {
                            $scope.refresh();
                        },
                        function(error) {
                            $scope.refresh();
                            var message = error.MessageDetail || 'Oops there was a problem deleting user, please try again';
                            dialogService.error(message);
                        }
                    );
                }, function () {
                });
            };

            $scope.getLinkedUsers = function() {
                if (!$scope.company) {
                    return [];
                }
                return $scope.company.users.filter(function(user){
                    return user.permissions && user.permissions.indexOf('admin') === -1;
                });
            };

            $scope.refresh = function () {
                $scope.refreshing = true;
                userService.getCompanyInfo().then(
                    function(data) {
                        $scope.company = data;
                    },
                    function() {
                        dialogService.error('Oops there was a problem loading account info, please try again');
                    }
                ).finally(
                    function() {
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
                        dialogService.error('Oops there was a problem loading account info, please try again');
                    }
                ).finally(
                    function () {
                        $scope.initializing = false;
                    }
                );
            };
        }]);