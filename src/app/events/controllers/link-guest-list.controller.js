'use strict';

angular.module('gliist')
    .controller('LinkGuestListCtrl', ['$scope', '$mdDialog',
        function ($scope, $mdDialog) {

            $scope.newGuestLists = {};
            $scope.selected = $scope.selected || [];

            $scope.toggleSelected = function (item) {
                var idx = $scope.selected.indexOf(item);
                if (idx > -1) {
                    $scope.selected.splice(idx, 1);
                } else {
                    $scope.selected.push(item);
                }
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.link = function (guestList) {

                $scope.event.guestLists.push(guestList);

                $mdDialog.hide();
            };

        }]);
