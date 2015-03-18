
//http://www.directiv.es/angular-round-progress-directive
//http://chieffancypants.github.io/angular-loading-bar/#
angular.module('agora').
    controller('feedCtrl', ['$scope', '$timeout', 'appStateService', 'pluginsService', '$templateCache', '$modal', '$document',
        function ($scope, $timeout, appStateService, pluginsService, $templateCache, $modal, $document) {
            'use strict';

            var onFeedRetrieved = function (feed) {
                $scope.gridData = feed.items;
                $scope.trending = feed.trending;
                $scope.fetchingData = false;
                $scope.pagination = feed.pagination;
            };

            var onFeedRetrievedFail = function (error) {
                $scope.danger("Error getting feed: " + JSON.stringify(error));
                $scope.fetchingData = false;
            };

            $scope.fetchingData = false;

            $scope.pagination = {};

            $scope.showImage = function (post) {

                var modalInstance = $modal.open({
                    templateUrl: 'feed/templates/image-viewer.tpl.html',
                    controller: 'imageViewerCtrl',
                    windowClass: 'modal-image-viewer',
                    resolve: {
                        entity: function () {
                            return post;
                        }
                    }
                });

            };

            $scope.showPerson = function (entity) {

                var modalInstance = $modal.open({
                    templateUrl: 'people/templates/profile-feed.tpl.html',
                    controller: 'profileFeedCtrl',
                    windowClass: 'modal-person-viewer',
                    resolve: {
                        profileData: function () {
                            return entity.user;
                        }
                    }
                });
            };

            $scope.showComments = function (entity) {

                var modalInstance = $modal.open({
                    templateUrl: 'common/templates/comments-dialog.tpl.html',
                    controller: 'commentsCtrl',
                    windowClass: 'modal-small',
                    resolve: {
                        entity: function () {
                            return entity;
                        }
                    }
                });
            };

            $scope.showLikes = function (entity) {

                var modalInstance = $modal.open({
                    templateUrl: 'common/templates/likes.tpl.html',
                    controller: 'commentsCtrl',
                    windowClass: 'modal-small',
                    resolve: {
                        entity: function () {
                            return entity;
                        }
                    }
                });
            };

            $scope.getNextPage = function () {

                if ($scope.fetchingData) {
                    return;
                }

                $scope.fetchingData = true;

                pluginsService.getUserFeed({
                    'pagination': $scope.pagination
                })
                    .then(function (feed) {

                        for (var i = 0; i < feed.items.length; i++) {
                            $scope.gridData.push(feed.items[i]);
                        }
                        $scope.fetchingData = false;
                        $scope.pagination = feed.pagination;
                    }, function (error) {
                        $scope.danger(JSON.stringify(error));
                        $scope.fetchingData = false;
                    });

            };

            $scope.trending = [];

            $scope.gridData = [];

            $scope.init = function () {

                $scope.fetchingData = true;

                if ($scope.person) {

                    if ($scope.person === "me") {
                        pluginsService.getUserFeed()
                            .then(onFeedRetrieved, onFeedRetrievedFail);
                    }
                    else {
                        pluginsService.getPersonFeed($scope.person)
                            .then(onFeedRetrieved, onFeedRetrievedFail);
                    }
                }
                else if ($scope.profile) {
                    pluginsService.getProfileFeed($scope.profile.social_id, $scope.profile.source)
                        .then(onFeedRetrieved, onFeedRetrievedFail);
                }
            };

            $scope.init();

        }]);

