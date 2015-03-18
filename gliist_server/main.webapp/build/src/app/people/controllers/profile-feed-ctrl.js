
angular.module('agora').
    controller('profileFeedCtrl', ['$scope', 'profileData', 'pluginsService',
        function ($scope, profileData, pluginsService) {
            'use strict';

            $scope.profile = profileData;

        }]);

