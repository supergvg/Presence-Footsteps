'use strict';

angular.module('gliist')
  .controller('EditGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state',
    function ($scope, $stateParams, dialogService, $state) {

        $scope.goBackToEvent = function(glist) {
            $state.go('main.edit_event', {eventId: $scope.eventId, view: 3});
        };

        $scope.init = function () {
            $scope.gliId = $stateParams.gli;
            $scope.eventId = $stateParams.eventId;
        };

    }]);
