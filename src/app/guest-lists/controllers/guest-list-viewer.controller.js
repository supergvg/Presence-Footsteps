'use strict';

angular.module('gliist')
    .controller('GuestListViewerCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$rootScope', '$filter', '$mdMedia',
        function ($scope, guestFactory, dialogService, $mdDialog, $rootScope, $filter, $mdMedia) {

            $scope.isStaff = function () {
                return $rootScope.isStaff();
            };

            $scope.gridOptions = {
                enableFiltering: false,
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
                },
                rowTemplate: '<div>' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                    'class="ui-grid-cell" ui-grid-cell></div>' +
                    '</div>',
                columnDefs: [
                    {field: 'title', name: 'Guest List'},
                    {field: 'total', name: 'Total', maxWidth: 100},
                    {field: 'listType', name: 'Category'},
                    {field: 'created_on', name: 'Date'},
                    {field: 'UpdatedOn', name: 'Update'},
                    {field: 'created_by', name: 'Created By', enableSorting: false}
                ],
                rowHeight: 45,
                enableColumnMenus: false,
                enableVerticalScrollbar: 2,
                enableHorizontalScrollbar: 0,
                data: []
            };
            if (!$scope.isStaff()) {
                $scope.gridOptions.columnDefs.push({
                    name: '', field: 'id', enableSorting: false, maxWidth: 140,
                    cellTemplate: '<div class="actions" title="Actions">' +
                        '<md-button class="icon-btn" ui-sref="main.edit_glist({listId:row.entity.id})" ng-hide="grid.appScope.options.readOnly" aria-label="Edit guest list">' +
                        '<md-tooltip md-direction="top">edit guest list</md-tooltip>' +
                        '<ng-md-icon icon="mode_edit"></ng-md-icon>' +
                        '</md-button>' +
                        '<md-button class="icon-btn" ng-click="grid.appScope.deleteGlist($event, row.entity.glist)" ng-disabled="grid.appScope.isRemoval(row.entity.glist)" ng-hide="grid.appScope.options.readOnly" aria-label="Delete guest list">' +
                        '<md-tooltip md-direction="top">delete guest list</md-tooltip>' +
                        '<ng-md-icon icon="delete"></ng-md-icon>' +
                        '</md-button>' +
                        '<md-checkbox ng-checked="grid.appScope.glistSelected(row.entity.glist)" ng-click="grid.appScope.toggleSelected(row.entity.glist)" aria-label="Import" ng-show="grid.appScope.options.enableSelection"></md-checkbox>'
                });
            }
            
            $scope.filter = {
                refresh: function() {
                    $scope.gridApi.grid.refresh();
                },
                value: ''
            };
            
            $scope.singleFilter = function(renderableRows) {
                var matcher = new RegExp($scope.filter.value, 'i');
                renderableRows.forEach(function(row) {
                    var match = false;
                    ['title', 'created_by'].forEach(function(field) {
                        if (row.entity[field].match(matcher)){
                            match = true;
                        }
                    });
                    if (!match) {
                        row.visible = false;
                    }
                });
                return renderableRows;
            };

            $scope.getTableHeight = function() {
                return {
                    height: (11 * $scope.gridOptions.rowHeight + $scope.gridOptions.rowHeight + 5) + 'px'
//                    height: ($scope.gridOptions.data.length * $scope.gridOptions.rowHeight + $scope.gridOptions.rowHeight + 5) + 'px'
                };
            };

            $scope.selected = $scope.selected || [];

            $scope.isRemoval = function(glist) {
                if (!$rootScope.isPromoter() || !glist.created_by) {
                    return false;
                }
                return glist.created_by.UserName !== $rootScope.currentUser.UserName;
            };

            $scope.glistSelected = function (glist) {
                var found;
                $scope.selected.forEach(function(item) {
                    if (glist.id === item.id) {
                        found = item;
                        return;
                    }
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
                        $scope.guestLists = $scope.guestLists.filter(function(item) {
                            return !angular.equals(glist, item);
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
            
            $scope.isMobile = function() {
                return !$mdMedia('gt-sm');
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
                        UpdatedOn: $filter('date')(gl.UpdatedOn, 'MMM dd, yy'),
                        created_by: gl.created_by ? gl.created_by.firstName +' '+ gl.created_by.lastName : '',
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
