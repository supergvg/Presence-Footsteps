'use strict';

angular.module('gliist')
    .controller('SignupCtrl', ['$scope', 'userService', 'dialogService', '$state', '$stateParams',
        function ($scope, userService, dialogService, $state, $stateParams) {
            $scope.user = {};
            $scope.options = {
                inviteMode: false,   //true = Invite link register
                freeRegister: true
            };

            $scope.displayErrorMessage = function(field) {
                return ($scope.showValidation) || (field && field.$touched);
            };

            $scope.register = function(form) {
                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }
                if ($scope.user.password !== $scope.user.confirmPassword) {
                    return;
                }
                $scope.sendinggData = true;
                userService.registerEmail($scope.user, $scope.options.inviteMode).then(function() {
                    $scope.user.username = null;
                    $scope.user.password = null;
                    $scope.user.confirmPassword = null;
                    $state.go('main.welcome');
                }, function(error) {
                    var message = (error && error.Message) || 'There was a problem signing up, please try again';
                    dialogService.error(message);
                }).finally(function() {
                    $scope.sendingData = false;
                });
            };
            
            $scope.init = function() {
                var company = $stateParams.company,
                    token = $stateParams.token;
                if (angular.isDefined(company) && angular.isDefined(token)) {
                    $scope.options.inviteMode = true;
                    $scope.loading = true;
                    userService.getInviteInfo(company, token).then(function(userInfo) {
                        if (!userInfo) {
                            $state.go('home');
                            return;
                        }
                        $scope.user = userInfo;
                        $scope.user.username = userInfo.email;
                        $scope.user.company = company;
                        $scope.user.token = token;
                    }, function() {
                        dialogService.error('There was a problem signing up, please try again');
                    }).finally(function() {
                        $scope.loading = false;
                    });
                }
            };
        }
    ]);