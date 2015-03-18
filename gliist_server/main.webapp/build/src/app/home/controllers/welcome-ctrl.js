//https://identity.telerik.com/v1/oauth/signin?ReturnUrl=%2fv1%2foauth%2fauthorize%3fclient_id%3duri%253atfis%26redirect_uri%3dhttps%253a%252f%252ftfis.telerik.com%252fIdentityProviders%252fTelerik%26scope%3d%26state%3dL0F1dGhlbnRpY2F0ZS9XUkFQdjAuOT93cmFwX2NsaWVudF9pZD1odHRwJTNhJTJmJTJmd3d3LmV2ZXJsaXZlLmNvbSZ3cmFwX2NhbGxiYWNrPWh0dHBzJTNhJTJmJTJmd3d3LmV2ZXJsaXZlLmNvbSUyZiZ3cmFwX2NsaWVudF9zdGF0ZT1FNzlEQ0MzNzBGRUE1RjM0QTdDOTY2MkRBRjU0ODNFQzdFNDJENjNERUYxRDIzOTU0NUMyNEExQzZEMEJDQjEwOjo0NTZFOTg4RTRFODUwNkY0NjBEQjY1RjE1NjUwRkI0QUJCNkEzQTM0MUMwNDREOEU1Q0ZDQTg2RkEzRTAwRTEzOjpodHRwOi8vd3d3LmV2ZXJsaXZlLmNvbQ%253d%253d%26access_type%3donline%26approval_prompt%3dauto%26response_type%3dcode

angular.module('agora').
    controller('welcomeCtrl', ['$scope', '$state', '$location', '$modal', 'appStateService', 'authenticationService', 'pluginsService', '$rootScope',
        function ($scope, $state, $location, $modal, appStateService, authenticationService, pluginsService, $rootScope) {
            'use strict';

            var onLoginFailed = function (error) {
                $scope.credentials.password = '';
                $scope.loginFailed = true;
                $scope.loginError = error;
                $scope.duringSubmit = false;
            }, onLoginSuccess = function () {
                $state.go('home');
                $scope.duringSubmit = false;
            };

            $scope.credentials = {};
            $scope.loginFailed = false;
            $scope.duringSubmit = false;
            $scope.loginError = {};

            $rootScope.$on("loginGranted", function () {
                $scope.$apply(function () {
                    onLoginSuccess(); 
                });
            });

            $scope.availablePlugins = pluginsService.getAvailablePlugins();

            $scope.onSocialLoginClicked = function (plugin) {
                pluginsService.login(plugin.name);
            };

            $scope.login = function () {
                $scope.duringSubmit = true;
                authenticationService.login($scope.credentials).then(onLoginSuccess, onLoginFailed);
            };

            $scope.signupEmail = function () {
                $state.go('signup');
            };
        }]);
