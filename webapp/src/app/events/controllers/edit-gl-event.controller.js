'use strict';

angular.module('gliist')
  .controller('EditGLEventCtrl', ['$scope', '$stateParams', '$state',
    function ($scope, $stateParams, $state) {

        $scope.goBackToEvent = function() {
            $state.go('main.edit_event', {eventId: $scope.eventId, view: 3});
        };

        $scope.init = function () {
            $scope.gliId = $stateParams.gli;
            $scope.eventId = $stateParams.eventId;
        };

    }]);