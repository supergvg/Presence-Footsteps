
angular.module('agora').
    controller('investigatePersonCtrl', ['$scope', 'person',
        function ($scope, person) {
            'use strict';

            $scope.profile = person;

        }]);

