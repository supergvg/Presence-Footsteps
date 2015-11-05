'use strict';

angular.module('gliist')
    .controller('SignupCtrl', ['$scope', '$mdDialog', 'userService', 'dialogService', '$state',
        function ($scope, $mdDialog, userService, dialogService, $state) {

            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || field.$touched;
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

            $scope.register = function (form) {

                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }

                if ($scope.user.password !== $scope.user.confirmPassword) {
                    return;
                }

                var inviteMode = $scope.options ? $scope.options.inviteMode : null;
                $scope.fetchingData = true;
                userService.registerEmail($scope.user, inviteMode).then(function () {
                    $scope.hide();
                    $state.go('main.welcome');
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

        }]);
