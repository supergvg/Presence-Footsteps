'use strict';

angular.module('gliist')
    .controller('SignupInviteCtrl', ['$scope', 'userService', 'dialogService', '$state', '$stateParams',
        function ($scope, userService, dialogService, $state, $stateParams) {
            
            $scope.user = {};

            $scope.register = function () {
                $scope.fetchingData = true;
                userService.registerEmail($scope.user).then(function() {
                    $scope.hide();
                    $state.go('main.welcome');
                }, function() {
                    dialogService.error('There was a problem signing up, please try again');
                }).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $scope.init = function() {
                $scope.options = {
                    inviteMode: true
                };

                $scope.loading = true;
                var company = $stateParams.company,
                    token = $stateParams.token;
                userService.getInviteInfo(company, token).then(function(userInfo) {
                    if (!userInfo) { //token is invalid
                        $state.go('main.welcome');
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
            };
        }]);