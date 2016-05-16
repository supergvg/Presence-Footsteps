'use strict';

angular.module('gliist')
    .controller('SignupCtrl', ['$scope', 'userService', 'dialogService', '$state',
        function ($scope, userService, dialogService, $state) {

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

                var inviteMode = $scope.options ? $scope.options.inviteMode : null;
                $scope.fetchingData = true;
                userService.registerEmail($scope.user, inviteMode).then(
                    function() {
                        $scope.user.username = null;
                        $scope.user.password = null;
                        $scope.user.confirmPassword = null;
                        $state.go('main.welcome');
                    }, function(error) {
                        var message = (error && error.Message) || 'There was a problem signing up, please try again';
                        dialogService.error(message);
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };
        }
    ]);