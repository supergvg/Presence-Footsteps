

angular.module('agora').
    controller('signupCtrl', ['$scope', '$state', 'authenticationService',
        function ($scope, $state, authenticationService) {
            'use strict';

            $scope.duringSubmit = false;
            $scope.newUser = {};

            $scope.cancel = function () {
                $state.go('home');
            };

            $scope.signup = function () {
                $scope.duringSubmit = true;
                $scope.errorDetails = null;
                authenticationService.registerEmail($scope.newUser).then(function () {

                    authenticationService.getCurrentUser().then(function (userData) {
                        $state.go('home');
                    }, function (error) {
                        $scope.loginError = error;
                    });

                }, function (error) {
                    $scope.duringSubmit = false;
                    if (error[""]) {
                        $scope.errorDetails = error[""][0];
                    }
                    else {
                        $scope.errorDetails = error;
                    }
                });
            };

        }]);
