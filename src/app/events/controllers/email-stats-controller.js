'use strict';

angular.module('gliist')
    .controller('EmailStatsController', ['$scope', 'eventsService', 'dialogService', '$state', '$stateParams', '$location', '$mdMedia',
        function ($scope, eventsService, dialogService, $state, $stateParams, $location, $mdMedia) {
            $scope.selectedIndex = parseInt($location.search().view) || 0;
            $scope.options = $scope.options || {};
            
            $scope.getSelected = function(idx) {
                return ($scope.selectedIndex === idx ? 'active' : '');
            };
            
            $scope.$watch('selectedIndex', function(newValue) {
                $location.search('view', newValue);
            });

            $scope.$watch(function() { return !$mdMedia('gt-sm'); }, function(status) {
                $scope.isMobile = status;
                var numberFields = $scope.gridOptions.columnDefs.length;
                if ($scope.gridOptions.columnDefs[$scope.gridOptions.columnDefs.length - 1].name === '') {
                    numberFields--;
                }
                $scope.gridOptions.rowHeight = $scope.isMobile ? 40 * numberFields + 22 : 45; // 40 - height field, 22 - row margin + border
//                $scope.initGridData($scope.guestLists);
            });

            $scope.gridOptions = {
                enableFiltering: false,
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
                },
                rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ng-keydown="grid.appScope.gridCellTab($event, col)"><dl><dt hide-gt-sm ng-hide="col.name === \'\'">{{col.name}}</dt><dd ui-grid-cell class="ui-grid-cell"></dd></dl></div>',
                columnDefs: [
                    {field: 'DeliveryStatus', name: 'Status'},
                    {field: 'FirstName', name: 'Name'},
                    {field: 'Email', name: 'Email'},
                    {field: 'GuestId', name: 'Select', cellTemplate: '<div class="actions"><md-checkbox ng-checked="grid.appScope.glistSelected(row.entity.glist)" ng-click="grid.appScope.toggleSelected(row.entity.glist)" aria-label="Import" ng-show="grid.appScope.options.enableSelection"></md-checkbox></div>'}
                ],
                enableColumnMenus: false,
                enableVerticalScrollbar: $scope.options.verticalScroll === false ? 0 : 2,
                enableHorizontalScrollbar: 0,
                enableSorting: false,
                data: []
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
                var numberItems = $scope.isMobile ? 2 : 6;
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
            
            $scope.init = function() {
                var eventId = $stateParams.eventId;
                    $scope.initializing = true;

                eventsService.getEvents(eventId).then(function(data) {
                    $scope.event = data;
                }, function() {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(function() {
                    $scope.initializing = false;
                });
            };
        }
    ]);