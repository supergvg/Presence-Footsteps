angular.module('agora').
    controller('imageGalleryCtrl', ['$scope', '$modal',
        function ($scope, $modal) {
            'use strict';


            $scope.openImage = function (image) {
                var modalInstance = $modal.open({
                    templateUrl: 'feed/templates/image-viewer.tpl.html',
                    controller: 'imageViewerCtrl',
                    windowClass: 'modal-image-viewer',
                    resolve: {
                        entity: function () {
                            return image;
                        }
                    }
                });
            };

        }]);

