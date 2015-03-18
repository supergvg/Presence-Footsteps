

angular.module('agora').
    controller('pluginsAccordionCtrl', ['$scope', 'personService',
        function ($scope, personService) {
            'use strict';

            //$scope.availablePlugins = personService.getAvailablePlugins($scope.person);
            $scope.availablePlugins = [
                { name: 'facebook', displayName: 'Facebook' },
                { name: 'instagram', displayName: 'Instagram' }
            ];

            $scope.$watchCollection('linkedProfiles', function (profiles) {

                if (!profiles) {
                    return;
                }

                angular.forEach(profiles, function (profile) {

                    var idx = _.findIndex($scope.availablePlugins, { 'name': profile.source });

                    if (idx >= 0) {
                        $scope.availablePlugins.splice(idx, 1);
                    }
                });

            });

        }]);
