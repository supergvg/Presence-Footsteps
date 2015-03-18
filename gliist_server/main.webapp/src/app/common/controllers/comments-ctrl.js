angular.module('agora').
    controller('commentsCtrl', ['$scope', 'entity',
        function ($scope, entity) {
            'use strict';

            $scope.entity = entity;

            $scope.comments = entity.comments;
        }]);

