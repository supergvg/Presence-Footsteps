angular.module('agora').directive('registerPlugins', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'registerPluginsCtrl',

        scope: {
            plugins: '=plugins',
            onClick: '=onClick',
            title: '@title'
        },

        replace: true,

        templateUrl: 'plugins/templates/register-plugins.tpl.html'
    };

}]);