'use strict';

angular.module('gliist')
    .controller('InviteUserCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService',
        function ($scope, $mdDialog, userService, dialogService) {
            
            $scope.permissions = [
                {
                    role: 'manager',
                    label: 'Manager',
                    desc: 'Same access as Admin but cant add contributor'
                },
                {
                    role: 'staff',
                    label: 'Staff',
                    desc: 'Allow to check guests in and check on event stats'
                },
                {
                    role: 'promoter',
                    label: 'Promoter',
                    desc: 'Allow to add guests to the list he is assigned to'
                }
            ];

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
                if (form && form.$invalid) {
                    var errors = {
                            required: {
                                firstName: 'First Name is required',
                                lastName: 'Last Name is required',
                                userName: 'Email is required'
                            }
                        },
                        errorMessage = [];
                    angular.forEach(form.$error, function(value, key) {
                        angular.forEach(value, function(value1) {
                            errorMessage.push(errors[key][value1.$name]);
                        });
                    });
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
                        function() {
                            dialogService.error('Oops there was a problem updating user, please try again');
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
                            if (error) {
                                dialogService.error(error.ExceptionMessage);
                            } else {
                                dialogService.error('Oops there was a problem sending invite please try again');
                            }
                        }
                    ).finally(function() {
                        $scope.fetchingData = false;
                    });
                }
            };
        }]);