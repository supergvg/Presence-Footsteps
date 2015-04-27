'use strict';

angular.module('gliist')
    .controller('GuestListViewerCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http', 'uploaderService',
        function ($scope, guestFactory, dialogService, $mdDialog, $http, uploaderService) {


            $scope.selected = $scope.selected || [];

            $scope.glistSelected = function (glist) {

                return _.find($scope.selected, function (item) {
                    return glist.id === item.id;
                });
            };
            $scope.toggleSelected = function (item) {
                var idx = $scope.selected.indexOf(item);
                if (idx > -1) {
                    $scope.selected.splice(idx, 1)
                } else {
                    $scope.selected.push(item);
                }
            };

            $scope.addMore = function () {
                $scope.list.guests.push({
                });
            };

            $scope.deleteGlist = function (ev, glist) {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    //.parent(angular.element(document.body))
                    .title('Are you sure you want to delete guest list?')
                    //.content('Confirm ')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {

                    if ($scope.local) {

                        $scope.guestLists = _.reject($scope.guestLists, function (item) {
                            return angular.equals(glist, item);
                        })

                        return;
                    }

                    guestFactory.GuestList.delete({id: glist.id}).$promise.then(function () {
                        $scope.getGuestLists();
                    }, function () {
                        dialogService.error('There was a problem please try again');
                    })


                }, function () {
                    $scope.alert = 'You decided to keep your debt.';
                });
            };

            $scope.showGlistDialog = function (ev, event) {

                var scope = $scope.$new();
                scope.currentGlist = event;
                scope.cancel = function () {
                    $mdDialog.cancel();
                };

                scope.save = function () {
                    $mdDialog.toggle();
                }

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-edit-dialog.tmpl.html',
                    targetEvent: ev
                });
            };

            $scope.getGuestLists = function () {

                if ($scope.lists) {
                    $scope.guestLists = $scope.lists;
                    $scope.local = true;
                    return;
                }

                $scope.fetchingData = true
                guestFactory.GuestLists.get().$promise.then(
                    function (data) {
                        $scope.guestLists = data;
                    }, function () {
                        dialogService.error('There was a problem getting lists, please try again');
                    }).finally(function () {
                        $scope.fetchingData = false;
                    })
            };

            $scope.init = function () {

                if (!$scope.options) {
                    $scope.options = {};
                }

            };

            $scope.init();

        }]);
