

angular.module('agora').
    controller('peopleCtrl', ['$scope', '$modal', '$http', 'personService',
        function ($scope, $modal, $http, personService) {
            'use strict';

            $scope.getFollowing = function () {

                $http({
                    method: 'GET',
                    url: '/api/memory/GetFollowing/'
                }).
                 success(function (data) {
                     $scope.following = data;
                 }).
                 error(function (data) {
                     alert(JSON.stringify(data));
                 });
            };

            $scope.mostPopular = [];

            $scope.recommended = [{ name: 'Justin Biber', source: ['instagram'] },
      { name: 'Eyal Golan', source: ['fb', 'instagram'] }];

            $scope.gridOptions = {
                data: 'mostPopular',
                multiSelect: false
            };

            $scope.init = function () {

                personService.getPersons().then(function (data) {
                    $scope.mostPopular = data;

                }, function (err) {
                    alert(JSON.stringify(err));
                });

                $scope.getFollowing();
            };

            $scope.init();

        }]);

