
angular.module('agora').
    controller('pluginDashboardController', ['$scope', '$timeout', '$http', '$modal',
        'pluginsService', 'signalRService', '$rootScope',
    function ($scope, $timeout, $http, $modal, pluginsService, signalRSvc, $rootScope) {
        'use strict';

        var loginFunctions = {
            'facebook': function () {
                pluginsService.login('facebook');
            },
            'instagram': function () {
                pluginsService.login('instagram');
            }
        };

        var pushProfile = function (pluginName, profileId) {
            pluginsService.getProfile(profileId, pluginName).then(function (profile) {
                $scope.userProfiles.push(profile);

            }, function (err) {
                $scope.danger("Error getting user profile: " + JSON.stringify(err));
            });
        };

        $scope.intentLogin = function (plugin) {

            if (!(plugin.name in loginFunctions)) {
                $scope.danger(plugin.name + 'login method not found');
                return;
            }

            loginFunctions[plugin.name]();
        };

        $scope.userProfiles = [];

        $rootScope.$on("pluginRegistered", function (e, pluginName, profileId) {
            $scope.$apply(function () {
                pushProfile(pluginName, profileId);
            });
        });

        $scope.$watch('currentUser', function (user) {

            if (!user) {
                return;
            }

            angular.forEach(user.plugins, function (plugin) {
                pushProfile(plugin.name, plugin.pluginUserId);
            });

        });
    }]);

