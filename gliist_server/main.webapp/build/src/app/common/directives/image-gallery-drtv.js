angular.module('agora').directive('imageGallery', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'imageGalleryCtrl',

        scope: {
            images: '=data'
        },

        replace: true,

        templateUrl: 'common/templates/image-gallery.tpl.html'
    };

}]);