'use strict';

angular.module('gliist')
    .controller('UIGridResponsiveCtrl', ['$scope', '$mdMedia', '$parse',
        function($scope, $mdMedia, $parse) {
            var defaultOptions = {
                filter: {
                    active: false,
                    placeholder: 'Search',
                    fields: []
                },
                sorting: {
                    active: false,
                    placeholder: 'Sort by'
                },
                display: {
                    totalMobileViewportItems: 2,
                    totalViewportItems: 11,
                    verticalScroll: true,
                    readOnly: false,
                    enableSelection: false,
                    enableGridSelection: false,
                    enableEditCells: false,
                    tip: ''
                },
                gridOptions: {
                    enableFiltering: false,
                    enableColumnMenus: false,
                    enableHorizontalScrollbar: 0,
                    selectionRowHeaderWidth: 50,
                    rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ng-keydown="grid.appScope.options.methods.gridCellTab($event, col)"><dl><dt hide-gt-sm ng-hide="col.name === \'\'">{{col.name}}</dt><dd ui-grid-cell class="ui-grid-cell"></dd></dl></div>',
                    columnDefs: [],
                    data: []
                },
                methods: {
                    updateGridData: function(){},
                    gridCellTab: function() {},
                    onRegisterApi: function(){}
                }
            };
            $scope.options = angular.merge(defaultOptions, $scope.options);
            $scope.options.gridOptions.enableVerticalScrollbar = $scope.options.display.verticalScroll === false ? 0 : 2;
            $scope.options.gridOptions.enableSorting = $scope.options.sorting.active;
            $scope.options.gridOptions.enableRowHeaderSelection = $scope.options.display.enableGridSelection;
            $scope.options.gridOptions.enableCellEdit = $scope.options.display.enableEditCells;
            $scope.options.gridOptions.enableCellEditOnFocus = $scope.options.display.enableEditCells;
            $scope.options.gridOptions.onRegisterApi = function(gridApi){
                $scope.gridApi = gridApi;
                if ($scope.options.filter.active) {
                    $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
                }
                $scope.options.methods.onRegisterApi($scope.gridApi);
            };
            
            $scope.sort = {
                sortingFields: [],
                sortField: ''
            };
            angular.forEach($scope.options.gridOptions.columnDefs, function(value){
                if (value.enableSorting === undefined || value.enableSorting) {
                    $scope.sort.sortingFields.push(value);
                }
            });
            
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
                    $scope.options.filter.fields.forEach(function(field) {
                        var getter = $parse('entity.'+field),
                            fieldValue = getter(row) || '';
                        if (fieldValue.match(matcher)){
                            match = true;
                        }
                    });
                    if (!match) {
                        row.visible = false;
                    }
                });
                return renderableRows;
            };
            
            $scope.$watch(function() { return !$mdMedia('gt-sm'); }, function(status) {
                $scope.isMobile = status;
                if ($scope.options.gridOptions.columnDefs.length > 0) {
                    var numberFields = $scope.options.gridOptions.columnDefs.length;
                    if ($scope.options.gridOptions.columnDefs[$scope.options.gridOptions.columnDefs.length - 1].cellClass === 'actions-col') {
                        numberFields--;
                    }
                    $scope.options.gridOptions.rowHeight = $scope.isMobile ? 40 * numberFields + 22 : 45; // 40 - height field, 22 - row margin + border
                    $scope.options.methods.updateGridData();
                }
            });
            
            $scope.getTableHeight = function() {
                var numberItems = $scope.isMobile ? $scope.options.display.totalMobileViewportItems : $scope.options.display.totalViewportItems;
                if ($scope.options.display.verticalScroll === false) {
                    numberItems = $scope.options.gridOptions.data.length;
                }
                if (!$scope.isMobile) {
                    numberItems++;
                }
                return {
                    height: (numberItems * $scope.options.gridOptions.rowHeight + 5) + 'px'
                };
            };
            
            $scope.getClass = function() {
                var classes = ['margin-top'];
                if ($scope.options.display.verticalScroll === false) {
                    classes.push('no-vertical-scroll');
                }
                if ($scope.options.display.enableEditCells === true) {
                    classes.push('grid-editable');
                }
                return classes;
            };
        }
    ]);