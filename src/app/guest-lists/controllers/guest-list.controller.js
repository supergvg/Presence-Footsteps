'use strict';

angular.module('gliist')
  .controller('GuestListCtrl', ['$scope',
    function($scope) {
        $scope.options = {
            filter: {
                active: true,
                placeholder: 'Search Guest List or Creator',
                fields: ['title', 'created_by']
            }, 
            sorting: {
                active: true
            }
        };
    }]);
