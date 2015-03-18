angular.module('agora').directive('searchResultsPeople', ['$parse', function ($parse) {
    'use strict';

    return {

        restrict: 'EA',

        controller: 'searchResultsPeopleCtrl',

        scope: {
            people: '=people',
            onUpdateClick: '=onUpdateClick'
        },

        replace: true,

        templateUrl: 'people/templates/search-results-people.tpl.html'
    };

}]);