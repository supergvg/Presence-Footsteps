

angular.module('agora').
    controller('peopleGridCtrl', ['$scope', '$modal',
        function ($scope, $modal) {
            'use strict';

            $scope.openPerson = function (person) {

                var modalInstance = $modal.open({
                    templateUrl: 'people/templates/person-dialog.tpl.html',
                    controller: 'personDialogCtrl',
                    windowClass: 'modal-person-viewer',
                    resolve: {
                        personData: function () {
                            return person;
                        }
                    }
                });
            };

        }]);

