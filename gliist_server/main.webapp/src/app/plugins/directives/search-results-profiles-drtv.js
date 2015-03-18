angular.module('agora').directive('searchResultsProfiles', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'searchResultsProfilesCtrl',

        scope: {
            profiles: '=profiles',
            person: '=person'
        },

        replace: true,

        templateUrl: 'plugins/templates/search-results-profiles.tpl.html'
    };

}]);