'use strict';

angular.module('gliist')
    .controller('GuestListEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http', 'uploaderService',
        function ($scope, guestFactory, dialogService, $mdDialog, $http, uploaderService) {

            function mergeGuestList(parent, merge) {
                parent.guests = parent.guests.concat(merge.guests); //TODO need to ignore merges
            }


            $scope.guestListTypes = [
                'GA',
                'VIP',
                'Guest',
                'Artist',
                'Production',
                'Staff',
                'Press'

            ];

            $scope.guests = [];

            $scope.selected = $scope.selected || [];


            $scope.onFileSelect = function (files) {
                if (!files || files.length === 0) {
                    return;
                }
                $scope.upload(files[0]);
            };


            $scope.upload = function (files) {
                $scope.fetchingData = true;
                uploaderService.uploadGuestList(files).then(function (data) {
                        _.extend($scope.list, data.data);
                    },
                    function (err) {
                        dialogService.error('There was a problem saving your image please try again');
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                )
            };

            $scope.onLinkClicked = function (ev) {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;
                scope.selected = [];
                scope.options = {
                    enableSelection: true
                }

                scope.importGLists = function () {
                    angular.forEach(scope.selected, function (gl) {
                            mergeGuestList($scope.list, gl);
                        }
                    );
                    $mdDialog.hide();
                };


                scope.cancel = function () {
                    $mdDialog.hide();
                };


                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
                    targetEvent: ev
                });
            }


            $scope.addMore = function () {
                $scope.list.guests.push({
                });
            };

            $scope.save = function () {
                $scope.fetchingData = true;

                if (!$scope.list.listType) {
                    $scope.list.listType = 'GA';
                }
                guestFactory.GuestList.update($scope.list).$promise.then(
                    function (res) {
                        $scope.list.id = res.id;
                        dialogService.success('Event created: ' + JSON.stringify(res));

                        if ($scope.onSave) {
                            $scope.onSave(res);
                        }

                    }, function () {
                        dialogService.error('There was a problem saving your guest list, please try again');
                    }).finally(function () {
                        $scope.fetchingData = false;
                    })
            };

            $scope.init = function () {

                if (!$scope.list) {
                    $scope.list = {
                        guests: [
                        ]
                    };
                }

                if (!$scope.options) {
                    $scope.options = {};
                }

            };

            $scope.init();

        }]);
