
angular.module('agora').
    controller('addProfilePersonCtrl', ['$scope', 'profileData', 'personService',
        function ($scope, profileData, personService) {
            'use strict';

            $scope.profile = profileData;

            $scope.linkProfileToPerson = function (person) {
                personService.followProfile($scope.profile, person);
            };

            $scope.searchPeople = function (queryString) {

                $scope.fetchingData = true;

                personService.getPersons(queryString).then(function (data) {
                    $scope.people = data;
                    $scope.fetchingData = false;
                }, function (err) {
                    $scope.danger(JSON.stringify(err));
                    $scope.fetchingData = false;
                });

            };
        }]);

