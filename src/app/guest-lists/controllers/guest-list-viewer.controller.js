'use strict';

angular.module('gliist')
    .controller('GuestListViewerCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$rootScope', '$filter', '$mdMedia',
        function ($scope, guestFactory, dialogService, $mdDialog, $rootScope, $filter, $mdMedia) {
            
            $scope.selected = $scope.selected || [];
            $scope.options = $scope.options || {};
            $scope.sort = {
                sortingFields: [],
                sortField: ''
            };
            
            $scope.$watch(function() { return !$mdMedia('gt-sm'); }, function(status) {
                $scope.isMobile = status;
                var numberFields = $scope.gridOptions.columnDefs.length;
                if ($scope.gridOptions.columnDefs[$scope.gridOptions.columnDefs.length - 1].name === '') {
                    numberFields--;
                }
                $scope.gridOptions.rowHeight = $scope.isMobile ? 40 * numberFields + 22 : 45; // 40 - height field, 22 - row margin + border
                $scope.initGridData($scope.guestLists);
            });

            function cellTemplate(data) {
                return '<div class="ui-grid-cell-contents" title="TOOLTIP"><dl><dt hide-gt-sm>'+data.name+'</dt><dd>{{COL_FIELD CUSTOM_FILTERS}}</dd></dl></div>';
            }

            $scope.gridOptions = {
                enableFiltering: false,
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
                },
                columnDefs: [
                    {field: 'title', name: 'Guest List'},
                    {field: 'total', name: 'Total', maxWidth: 100},
                    {field: 'listType', name: 'Category'},
                    {field: 'created_on', name: 'Date'},
                    {field: 'UpdatedOn', name: 'Update'},
                    {field: 'created_by', name: 'Created By', enableSorting: false}
                ],
                enableColumnMenus: false,
                enableVerticalScrollbar: $scope.options.verticalScroll === false ? 0 : 2,
                enableHorizontalScrollbar: 0,
                enableSorting: false,
                data: []
            };
            if ($scope.options.sorting !== undefined) {
                $scope.gridOptions.enableSorting = $scope.options.sorting;
            }
            
            angular.forEach($scope.gridOptions.columnDefs, function(value, key){
                this[key].cellTemplate = cellTemplate(this[key]);
                if (value.enableSorting === undefined || value.enableSorting) {
                    $scope.sort.sortingFields.push(value);
                }
            }, $scope.gridOptions.columnDefs);
            
            if (!$rootScope.isStaff()) {
                $scope.gridOptions.columnDefs.push({
                    name: '', field: 'id', enableSorting: false, width: 140, cellClass: 'actions-col',
                    cellTemplate: '<div class="actions">' +
                                  '     <md-button class="icon-btn" ui-sref="main.edit_glist({listId:row.entity.id})" ng-hide="grid.appScope.options.readOnly" aria-label="Edit guest list">' +
                                  '         <md-tooltip md-direction="top">edit guest list</md-tooltip>' +
                                  '         <ng-md-icon icon="mode_edit"></ng-md-icon>' +
                                  '     </md-button>' +
                                  '     <md-button class="icon-btn" ng-click="grid.appScope.deleteGlist($event, row.entity.glist)" ng-disabled="grid.appScope.isRemoval(row.entity.glist)" ng-hide="grid.appScope.options.readOnly" aria-label="Delete guest list">' +
                                  '         <md-tooltip md-direction="top">delete guest list</md-tooltip>' +
                                  '         <ng-md-icon icon="delete"></ng-md-icon>' +
                                  '     </md-button>' +
                                  '     <md-checkbox ng-checked="grid.appScope.glistSelected(row.entity.glist)" ng-click="grid.appScope.toggleSelected(row.entity.glist)" aria-label="Import" ng-show="grid.appScope.options.enableSelection"></md-checkbox>' +
                                  '</div>'
                });
            }
            
            $scope.setSortField = function() {
                var column = $scope.gridApi.grid.getColumn($scope.sort.sortField);
                $scope.gridApi.grid.sortColumn(column);
                $scope.gridApi.grid.refresh();
            };
            
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
                var numberItems = $scope.isMobile ? 2 : 11;
                if ($scope.options.verticalScroll === false) {
                    numberItems = $scope.gridOptions.data.length;
                }
                if (!$scope.isMobile) {
                    numberItems++;
                }
                return {
                    height: (numberItems * $scope.gridOptions.rowHeight + 5) + 'px'
                };
            };
            
            $scope.getClass = function() {
                var classes = ['margin-top'];
                if ($scope.options.verticalScroll === false) {
                    classes.push('no-vertical-scroll');
                }
                return classes;
            };

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
                $mdDialog.show(confirm).then(function() {
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
                }, function() {
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
        }]);
