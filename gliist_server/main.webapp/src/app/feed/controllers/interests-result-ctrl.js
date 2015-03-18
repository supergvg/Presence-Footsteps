

angular.module('agora').
    controller('interestsResultCtrl', ['$scope', '$modal', 'pluginsService', '$stateParams', 'personService',
        function ($scope, $modal, pluginsService, $stateParams, personService) {
            'use strict';

            $scope.columns = [{ name: 'Person' },
                { name: 'Source' }];

            $scope.fetchingData = false;

            $scope.gridData = {};

            $scope.searchTerm = $stateParams.searchQuery;

            $scope.init = function () {

                var queryString = $stateParams.searchQuery;
                $scope.fetchingData = true;

                pluginsService.search(queryString).then(
                   function (result) {
                       $scope.gridData = result.people;
                       $scope.fetchingData = false;
                   },
                   function (error) {
                       $scope.danger('Search results error: ' + JSON.stringify(error));
                       $scope.fetchingData = false;
                   }

                   );
            };

            $scope.init();

        }]);

