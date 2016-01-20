'use strict';

angular.module('gliist')
    .controller('GuestListViewerCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$rootScope', '$filter',
        function ($scope, guestFactory, dialogService, $mdDialog, $rootScope, $filter) {

            $scope.isStaff = function () {
                return $rootScope.isStaff();
            };

            $scope.gridOptions = {
                rowTemplate: '<div>' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                    'class="ui-grid-cell" ui-grid-cell></div>' +
                    '</div>',
                columnDefs: [
                    {field: 'title', name: 'Guest List'},
                    {field: 'total', name: 'Total', enableSorting: false},
                    {field: 'listType', name: 'Category'},
                    {field: 'created_on', name: 'Date'},
                    {field: 'created_by', name: 'Created By', enableSorting: false}
                ],
                rowHeight: 45,
                enableColumnMenus: false,
                enableVerticalScrollbar: 0,
                enableHorizontalScrollbar: 0,
                data: []
            };
            if (!$scope.isStaff()) {
                $scope.gridOptions.columnDefs.push({
                    name: '', field: 'id', enableSorting: false,
                    cellTemplate: '<div class="actions" title="Actions">' +
                        '<md-button class="icon-btn" ui-sref="main.edit_glist({listId:{{row.entity.id}}})" ng-disabled="grid.appScope.blockEdit(row.entity.glist)" ng-hide="grid.appScope.options.readOnly">' +
                        '<md-tooltip md-direction="top">edit guest list</md-tooltip>' +
                        '<ng-md-icon icon="mode_edit"></ng-md-icon>' +
                        '</md-button>' +
                        '<md-button class="icon-btn" ng-click="grid.appScope.deleteGlist($event, row.entity.glist)" ng-disabled="grid.appScope.blockEdit(row.entity.glist)" ng-hide="grid.appScope.options.readOnly">' +
                        '<md-tooltip md-direction="top">delete guest list</md-tooltip>' +
                        '<ng-md-icon icon="delete"></ng-md-icon>' +
                        '</md-button>' +
                        '<md-checkbox ng-checked="grid.appScope.glistSelected(row.entity.glist)" ng-click="grid.appScope.toggleSelected(row.entity.glist)" aria-label="Import" ng-show="grid.appScope.options.enableSelection"></md-checkbox>'
                });
            }

            $scope.getTableHeight = function() {
                return {
                    height: ($scope.gridOptions.data.length * $scope.gridOptions.rowHeight + $scope.gridOptions.rowHeight + 5) + "px"
                };
            };

            $scope.selected = $scope.selected || [];

            $scope.blockEdit = function(glist) {
                if (!$rootScope.isPromoter() || !glist.created_by) {
                    return false;
                }

                return glist.created_by.UserName !== $rootScope.currentUser.UserName;
            };

            $scope.getTotalGuests = function (glist) {
                var total = 0;

                angular.forEach(glist.guests,
                        function (guest_info) {
                            total += guest_info.plus + 1;
                        });

                return total;

            };

            $scope.glistSelected = function (glist) {

                var found = _.find($scope.selected, function (item) {
                    return glist.id === item.id;
                });

                if (found) {
                    return true;
                }

                return false;
            };
            $scope.toggleSelected = function (item) {
                var idx = $scope.selected.indexOf(item);
                if (idx > -1) {
                    $scope.selected.splice(idx, 1);
                } else {
                    $scope.selected.push(item);
                }
            };

            $scope.addMore = function () {
                $scope.list.guests.push({});
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
                        });

                        return;
                    }

                    guestFactory.GuestList.delete({id: glist.id}).$promise.then(function () {
                        $scope.getGuestLists();
                    }, function () {
                        dialogService.error('There was a problem please try again');
                    });


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
                };

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

                $scope.fetchingData = true;
                guestFactory.GuestLists.get().$promise.then(
                    function(data) {
                        $scope.guestLists = data;
                        $scope.initGridData(data);
                    }, 
                    function() {
                        dialogService.error('There was a problem getting lists, please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };
            
            $scope.initGridData = function(data) {
                $scope.gridOptions.data = [];
                if (!data) {
                    return;
                }
                angular.forEach(data, function(gl) {
                    $scope.gridOptions.data.push({
                        id: gl.id,
                        title: gl.title,
                        total: gl.total,
                        listType: gl.listType,
                        created_on: $filter('date')(gl.created_on, 'MMM dd, yy'),
                        created_by: gl.created_by.firstName +' '+ gl.created_by.lastName,
                        glist: gl
                    });
                });
            };

            $scope.init = function () {
                if (!$scope.options) {
                    $scope.options = {};
                }
            };

            $scope.init();
        }]);
