'use strict';

angular.module('gliist')
    .controller('InviteUserCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', 'permissionsService',
        function ($scope, $mdDialog, userService, dialogService, permissionsService) {
            $scope.rolesOrder = ['manager', 'staff', 'promoter'];
            $scope.roles = permissionsService.roles;
            $scope.init = function() {
                $scope.linkedAccountInEdit = $scope.linked_account || {};
                $scope.selected = $scope.linkedAccountInEdit.permissions ? $scope.linkedAccountInEdit.permissions : '';
            };
            $scope.init();

            $scope.toggleSelected = function(role) {
                $scope.selected = role;
            };

            $scope.isSelected = function(role) {
                return role === $scope.selected;
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.save = function(form) {
                var errorMessage = [];
                if (form && form.$invalid) {
                    var errors = {
                            required: {
                                firstName: 'First Name is required',
                                lastName: 'Last Name is required',
                                userName: 'Email is required'
                            },
                            email: {
                                userName: 'Email is incorrect'
                            }
                        };
                    angular.forEach(form.$error, function(value, key) {
                        angular.forEach(value, function(value1) {
                            errorMessage.push(errors[key][value1.$name]);
                        });
                    });
                }
                if ($scope.selected === '') {
                    errorMessage.push('Select role');
                }
                if (errorMessage.length > 0) {
                    dialogService.error(errorMessage.join(', '));
                    return;
                }
                $scope.linkedAccountInEdit.permissions = $scope.selected;
                $scope.fetchingData = true;
                if ($scope.linkedAccountInEdit.Id) {
                    userService.updateCompanyUser($scope.linkedAccountInEdit).then(
                        function() {
                            $scope.linked_account = $scope.linkedAccountInEdit;
                            $mdDialog.hide();
                        },
                        function(error) {
                            var message = error.ExceptionMessage || error.Message || 'Oops there was a problem sending invite please try again';
                            dialogService.error(message);
                        }
                    ).finally(function() {
                        $scope.fetchingData = false;
                    });
                } else {
                    userService.sendJoinRequest($scope.linkedAccountInEdit).then(
                        function() {
                            $mdDialog.hide();
                        },
                        function(error) {
                            var message = error.ExceptionMessage || error.Message || 'Oops there was a problem sending invite please try again';
                            dialogService.error(message);
                        }
                    ).finally(function() {
                        $scope.fetchingData = false;
                    });
                }
            };
        }]);