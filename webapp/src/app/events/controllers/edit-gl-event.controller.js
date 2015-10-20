'use strict';

angular.module('gliist')
  .controller('EditGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state',
    function ($scope, $stateParams, dialogService, $state) {

        $scope.goBackToEvent = function(glist) {
            var eventId = $stateParams.eventId;
            $state.go('main.edit_event', {eventId: eventId, view: 3});
        };

        $scope.init = function () {
            $scope.gliId = $stateParams.gli;
        };

    }]);
