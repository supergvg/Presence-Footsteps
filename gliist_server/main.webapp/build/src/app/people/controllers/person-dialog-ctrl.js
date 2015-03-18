

angular.module('agora').
    controller('personDialogCtrl', ['$scope', 'personData', '$state', '$modalInstance', 'pluginsService', 'personService', '$modal',
        function ($scope, personData, $state, $modalInstance, pluginsService, personService, $modal) {
            'use strict';

            $scope.person = personData;

            $scope.fetchingImages = false;

            $scope.modalView = true;

            $scope.photos = [];

            $scope.availablePlugins = personService.getAvailablePlugins($scope.person);

            $scope.linkSocialProfile = function (plugin) {

                var modalInstance = $modal.open({
                    templateUrl: 'plugins/templates/link-social-profile.tpl.html',
                    controller: 'linkSocialProfileCtrl',
                    windowClass: 'modal-person-viewer',
                    resolve: {
                        personData: function () {
                            return $scope.person;
                        },
                        pluginData: function () {
                            return plugin;
                        }
                    }
                });

            };

            $scope.goToFullScreen = function () {
                $state.go('personPage', { personData: JSON.stringify($scope.person) });
                $modalInstance.dismiss();
            };

            $scope.removeProfile = function (profile) {
                alert(profile + JSON.stringify(profile));
            };

            $scope.getNextPage = function () {

                if ($scope.fetchingImages || !$scope.pagination) {
                    return;
                }

                $scope.fetchingImages = true;

                pluginsService.getPersonPictures($scope.person, $scope.pagination).then(function (res) {

                    for (var i = 0; i < res.items.length; i++) {
                        $scope.photos.push(res.items[i]);
                    }
                    $scope.pagination = res.pagination;
                    $scope.fetchingImages = false;
                }, function (err) {
                    $scope.fetchingImages = false;
                });
            };

            $scope.getPictures = function () {

                if ($scope.fetchingImages) {
                    return;
                }

                $scope.fetchingImages = true;

                pluginsService.getPersonPictures($scope.person).then(function (res) {
                    $scope.photos = res.items;
                    $scope.fetchingImages = false;
                }, function (err) {
                    $scope.fetchingImages = false;
                });
            };

            $scope.init = function () {
                $scope.getPictures();
            };

            $scope.init();

        }]);



angular.module('agora').
    controller('personCtrl', ['$scope', '$stateParams', '$modal', 'pluginsService', 'personService',
        function ($scope, $stateParams, $modal, pluginsService, personService) {
            'use strict';

            $scope.person = JSON.parse($stateParams.personData);
            $scope.photos = [];
            $scope.fetchingImages = false;

            $scope.linkSocialProfile = function (plugin) {

                var modalInstance = $modal.open({
                    templateUrl: 'plugins/templates/link-social-profile.tpl.html',
                    controller: 'linkSocialProfileCtrl',
                    windowClass: 'modal-person-viewer',
                    resolve: {
                        personData: function () {
                            return $scope.person;
                        },
                        pluginData: function () {
                            return plugin;
                        }
                    }
                });

            };

            $scope.availablePlugins = personService.getAvailablePlugins($scope.person);

            $scope.removeProfile = function (profile) {
                alert(profile + JSON.stringify(profile));
            };

            $scope.getPictures = function () {

                if ($scope.fetchingImages) {
                    return;
                }

                $scope.fetchingImages = true;

                pluginsService.getPersonPictures($scope.person).then(function (res) {
                    $scope.photos = res.items;
                    $scope.pagination = res.pagination;
                    $scope.fetchingImages = false;
                }, function (err) {
                    $scope.fetchingImages = false;
                });
            };

            $scope.getNextPage = function () {

                if ($scope.fetchingImages || !$scope.pagination) {
                    return;
                }

                $scope.fetchingImages = true;

                pluginsService.getPersonPictures($scope.person, $scope.pagination).then(function (res) {

                    for (var i = 0; i < res.items.length; i++) {
                        $scope.photos.push(res.items[i]);
                    }
                    $scope.pagination = res.pagination;
                    $scope.fetchingImages = false;
                }, function (err) {
                    $scope.fetchingImages = false;
                });
            };

            $scope.init = function () {
                $scope.getPictures();
            };

            $scope.init();
        }]);

