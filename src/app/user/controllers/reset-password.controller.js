'use strict';

angular.module('gliist')
    .controller('ResetPasswordCtrl', ['$scope', 'userService', 'dialogService', '$state', '$stateParams',
        function ($scope, userService, dialogService, $state, $stateParams) {
            $scope.resetSent = false;
            $scope.user = {};

            $scope.onResetClicked = function(form) {
                var errorMessage = [];
                if ($scope.user.password !== $scope.user.confirmPassword) {
                    errorMessage.push('Password don\'t match');
                }
                if (form && form.$invalid) {
                    if (form) {
                        var errors = {
                            required: {
                                password: 'Please Enter Password',
                                confirm: 'Please Confirm Password'
                            }
                        };
                        angular.forEach(form.$error, function(value, key){
                            if (errors[key]) {
                                angular.forEach(value, function(value1){
                                    if (errors[key][value1.$name]) {
                                        errorMessage.push(errors[key][value1.$name]);
                                    }
                                });
                            }
                        });
                    }
                }
                if (errorMessage.length > 0) {
                    dialogService.error(errorMessage.join(', '));
                    return;
                }
                
                $scope.fetchingData = true;
                userService.resetPassword({
                    token: $scope.token,
                    NewPassword: $scope.user.password,
                    ConfirmPassword: $scope.user.confirmPassword
                }).then(function() {
                    $scope.resetSent = true;
                    dialogService.success('Password Changed');
                }, function(error) {
                    if (error) {
                      dialogService.error(error.ExceptionMessage);
                    } else {
                      dialogService.error('Oops there was a problem please try again');
                    }
                }).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $scope.init = function () {
                $scope.token = $stateParams.token;
                if (!$scope.token) {
                    $state.go('home');
                }
            };
        }
    ]);
