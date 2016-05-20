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
            },
            display: {
                tip: '*Tip: add/delete guests to guest list here <span>before</span> linking to an event to reflect the changes NOT after'
            }
        };
    }]);
