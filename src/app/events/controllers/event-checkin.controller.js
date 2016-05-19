'use strict';

angular.module('gliist')
    .controller('EventCheckinCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$filter', '$window',
        function ($scope, $stateParams, dialogService, $state, eventsService, $filter, $window) {
            
            $scope.options = $scope.options || {};
            $scope.event = {id: 0};
            
            $scope.getExportExcelUrl = function() {
                return $window.redirectUrl+'api/Event/GuestsListsExcelFile/'+$scope.event.id+'?authToken='+$window.localStorage.access_token;
            };
            
            $scope.checkinGuest = function(checkin) {
                $state.go('main.check_guest', {
                    guestId: checkin.guest.id,
                    gliId: checkin.gl_id
                });
            };

            $scope.gridOptions = {
                enableFiltering: false,
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
                },
                rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ng-keydown="grid.appScope.gridCellTab($event, col)"><dl><dt hide-gt-sm ng-hide="col.name === \'\'">{{col.name}}</dt><dd ui-grid-cell class="ui-grid-cell"></dd></dl></div>',
                columnDefs: [
                    {field: 'guest.firstName', name: 'First Name', enableHiding: false},
                    {field: 'guest.lastName', name: 'Last Name', enableHiding: false},
                    {field: 'guest.title', name: 'List Title', enableHiding: false},
                    {field: 'guest.type', name: 'Type', enableSorting: true, enableHiding: false, width: 80},
                    {field: 'guest.email', name: 'Email', enableSorting: false, enableHiding: false},
                    {field: 'guest.plus', name: 'Plus', enableSorting: false, enableHiding: false, width: 80},
                    {
                        name: 'Check in', field: 'guest.id', enableSorting: false, enableHiding: false, width: 90,
                        cellTemplate: '<div class="actions" title="Checkin">' +
                            '<md-button class="icon-btn" md-no-ink="\'true\'" ng-click="grid.appScope.checkinGuest(row.entity)" aria-label="CheckIn">' +
                            '<md-icon ng-show="row.entity.status == \'checked in\'" md-svg-src="assets/images/SVG/checkWhite.svg"></md-icon>' +
                            '<md-icon ng-show="grid.appScope.guestPending(row.entity)" md-svg-src="assets/images/SVG/checklist.svg"></md-icon>' +
                            '</md-button>' +
                            '</div>'
                    }

                ],
                rowHeight: 45,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false,
                data: []
            };

            $scope.filter = {
                value: '',
                status: 'pending'
            };
            
            $scope.singleFilter = function(renderableRows) {
                var matcher = new RegExp($scope.filter.value, 'i');
                renderableRows.forEach(function(row) {
                    row.visible = false;
                    if ($scope.filter.status === 'checked' && !$scope.guestPending(row.entity)) {
                        row.visible = true;
                    }
                    if ($scope.filter.status === 'pending' && $scope.guestPending(row.entity)) {
                        row.visible = true;
                    }
                    var match = false;
                    ['firstName', 'lastName'].forEach(function(field) {
                        if (row.entity.guest[field] && row.entity.guest[field].match(matcher)){
                            match = true;
                        }
                    });
                    if (!match) {
                        row.visible = false;
                    }
                });
                return renderableRows;
            };

            $scope.$watchCollection('filter', function(newValue) {
                if (!newValue) {
                    return;
                }
                $scope.gridApi.grid.refresh();
            });
            
            $scope.getTableHeight = function() {
                var numberItems = $scope.isMobile ? 2 : 7;
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

            $scope.guestPending = function(checkin) {
                return (checkin.status === 'no show');
            };

            $scope.initGridData = function(data) {
                if (!data) {
                    return;
                }
                $scope.gridOptions.data = [];
                angular.forEach(data.guestLists, function(gl) {
                    angular.forEach(gl.actual, function(checkin) {
                        if (!checkin.guest.type) {
                            checkin.guest.type = gl.listType;
                        }
                        if (!checkin.guest.title) {
                            checkin.guest.title = gl.title;
                        }
                        $scope.gridOptions.data.push(checkin);
                    });
                });
            };

            $scope.pastEvent = function() {
                var endTime = $filter('ignoreTimeZone')($scope.event.endTime);
                if (Date.now() > endTime.getTime()) {
                    return true;
                }
                return false;
            };

            $scope.init = function () {
                var eventId = $stateParams.eventId;
                $scope.initializing = true;
                eventsService.getEvents(eventId).then(function(data) {
                    $scope.event = data;
                    if ($scope.pastEvent()) {
                        $scope.gridOptions.columnDefs.pop();
                    }
                    $scope.initGridData(data);
                }, function() {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(function() {
                    $scope.initializing = false;
                });
            };

            $scope.init();
        }
    ]);
