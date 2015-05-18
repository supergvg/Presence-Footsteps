'use strict';

angular.module('gliist')
    .controller('SignupInviteCtrl', ['$scope', 'userService', 'dialogService', '$state', '$stateParams',
        function ($scope, userService, dialogService, $state, $stateParams) {

            $scope.user = {};

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.register = function () {
                $scope.fetchingData = true;
                userService.registerEmail($scope.user).then(function () {
                    $scope.hide();
                    $state.go('main');
                }, function (err) {
                    dialogService.error(JSON.stringify(err));
                    dialogService.error('There was a problem signing up, please try again');
                }).
                    finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            };

            $scope.init = function () {

                $scope.options = {
                    inviteMode: true
                };

                $scope.loading = true;
                var company = $stateParams.company,
                    token = $stateParams.token;
                userService.getInviteInfo(company, token).then(function (userInfo) {

                    if (!userInfo) { //token is invalid
                        $state.go('main');
                    }

                    $scope.user = userInfo;
                    $scope.user.username = userInfo.email;
                    $scope.user.company = company;
                    $scope.user.token = token;

                }, function (err) {
                    dialogService.error('There was a problem signing up, please try again');
                }).
                    finally(
                    function () {
                        $scope.loading = false;
                    }
                );

            };

        }]);
