

angular.module('agora').
    controller('searchResultsProfilesCtrl', ['$scope', '$modal', 'personService',
        function ($scope, $modal, personService) {
            'use strict';

            $scope.investigatePerson = function (profile) {

                var modalInstance = $modal.open({
                    templateUrl: 'people/templates/investigate-person.tpl.html',
                    controller: 'investigatePersonCtrl',
                    resolve: {
                        person: function () {
                            return profile;
                        }
                    }
                });
            };

            $scope.linkProfileToNewPerson = function (profile) {

                personService.followProfile(profile).then(function (res) {
                    profile.following = !profile.following;
                });
            };

            $scope.linkProfileToExisitngPerson = function (profile) {

                if (!$scope.person) {

                    var modalInstance = $modal.open({
                        templateUrl: 'people/templates/add-profile-person.tpl.html',
                        controller: 'addProfilePersonCtrl',
                        windowClass: 'modal-person-viewer',
                        resolve: {
                            profileData: function () {
                                return profile;
                            }
                        }
                    });

                    modalInstance.result.then(function (person) {
                        personService.followProfile(profile, $scope.person).then(function (res) {
                            profile.following = !profile.following;
                        });
                    });

                }
                else {
                    personService.followProfile(profile, $scope.person).then(function (res) {
                        profile.following = !profile.following;
                    });
                }
            };

            $scope.viewProfileFeed = function (profile) {

                var modalInstance = $modal.open({
                    templateUrl: 'people/templates/profile-feed.tpl.html',
                    windowClass: 'modal-person-viewer',
                    controller: 'profileFeedCtrl',
                    resolve: {
                        profileData: function () {
                            return profile;
                        }
                    }
                });

            };


        }]);
