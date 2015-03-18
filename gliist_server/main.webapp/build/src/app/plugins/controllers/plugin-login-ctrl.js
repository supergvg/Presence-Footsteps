

angular.module('agora').
    controller('pluginLoginCtrl', ['$scope', '$q', '$http', '$window', '$stateParams', 'appStateService', '$rootScope', 'signalRService',
function ($scope, $q, $http, $window, $stateParams, appStateService, $rootScope, signalRService) {
    'use strict';

    var svc = this,
        authLink;

    $scope.callerId = $stateParams.callerId;

    $scope.pluginData = {
        pluginUserId: $stateParams.pluginUserId,
        accessToken: $stateParams.pluginAccessToken,
        name: $stateParams.pluginName
    };

    $scope.getLoginLink = function (pluginName) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/api/plugins/GetLoginLink/',
            params: {
                'plugin': pluginName,
                'callerId': $scope.callerId
            },
        }).
          success(function (res) {
              authLink = res.auth_link;
              deferred.resolve(authLink);
          }).
          error(function (error) {
              deferred.reject(error);
          });

        return deferred.promise;
    };

    $scope.login = function () {
        var deferred = $q.defer();

        $scope.getLoginLink($scope.pluginData.name).then(function (authLink) {
            $window.location = authLink;

        }, function (error) {
            $scope.danger("login to plugin: " + $scope.pluginData.name + "error: " + JSON.stringify(error));
            deferred.reject(error);
        });

        return deferred;
    };

    $scope.init = function () {

        if (!$stateParams.userId) {
            $scope.login();
            return;
        }

        if ($stateParams.access_token) {
            //login to agora using third party plugin
            var auth_object = {
                access_token: $stateParams.access_token,
                userName: $stateParams.userName
            };

            $rootScope.$emit("pluginAuthenticated", $scope.pluginData.name, $scope.pluginData.pluginUserId, auth_object);  //raise event to save token cookie

            //call this method to signal parent instance that login was completed -> will cause partent to refresh and goto welcome screen
            signalRService.notifyPluginAuthenticated($scope.pluginData.name, $scope.pluginData.pluginUserId, $scope.callerId).then(function () {
                $window.close();
            });
        }
        else {
            //plugin registration completed

            //call this method to signal parent instance that login was completed -> will cause partent to refresh and goto welcome screen
            signalRService.notifyPluginRegistered($scope.pluginData.name, $scope.pluginData.pluginUserId, $scope.callerId).then(function () {
                $window.close();
            });


        }

    };

    $scope.init();
}]);
