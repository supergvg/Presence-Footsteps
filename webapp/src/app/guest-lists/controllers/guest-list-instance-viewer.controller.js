'use strict';

angular.module('gliist')
    .controller('GuestListInstanceViewerCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http', 'uploaderService',
        function ($scope, guestFactory, dialogService, $mdDialog, $http, uploaderService) {

            $scope.editInstance = function (ev, instance) {
                alert('edit instance!');
            }
            $scope.deleteInstance = function (ev, instance) {
                alert('delete instance!');
            }


        }]);
