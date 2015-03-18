

angular.module('agora').
    controller('linkSocialProfileCtrl', ['$scope', 'pluginsService', 'personData', 'pluginData',
        function ($scope, pluginsService, personData, pluginData) {
            'use strict';

            $scope.person = personData;
            $scope.plugin = pluginData;
            $scope.fetchingData = false;

            $scope.searchProfiles = function (queryString) {
                // BUTTONS SHOULD BE COUSTOMIEZS

                $scope.fetchingData = true;
                var pluginNames = _.map([$scope.plugin], 'name');
                pluginsService.search(queryString, pluginNames).then(
                  function (result) {
                      $scope.gridData = result.people;
                      $scope.fetchingData = false;
                  },
                  function (error) {
                      $scope.danger('Search Profile: '+ JSON.stringify(error));
                      $scope.fetchingData = false;
                  });
            };

        }]);
