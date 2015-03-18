angular.module('agora').directive('pluginsAccordion', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'pluginsAccordionCtrl',

        scope: {
            linkedProfiles: '=linkedProfiles',
            person: '=person',
            onClick: '=onClick',
        },

        replace: true,

        templateUrl: 'plugins/templates/plugins-accordion.tpl.html'
    };

}]);