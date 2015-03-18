
angular.module('agora').
    controller('imageViewerCtrl', ['$scope', 'entity', '$modal', '$modalInstance',
        function ($scope, entity, $modal, $modalInstance) {
            'use strict';

            $scope.imageUrl = entity.picture_source.original;
            $scope.post = entity;
            $scope.comments = entity.comments;


            $scope.close = function () {
                $modalInstance.dismiss();
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

        }]);

