'use strict';

angular.module('gliist')
  .controller('GuestListCtrl', ['$scope',
    function($scope) {
        $scope.options = {
            sorting: {
                active: true
            },
            display: {
                tip: '*Tip: add/delete guests to guest list here <span>before</span> linking to an event to reflect the changes NOT after'
            }
        };
    }]);
