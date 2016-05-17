'use strict';

angular.module('gliist')
    .controller('EmailStatsController', ['$scope', 'eventsService', 'dialogService', '$state', '$stateParams', '$location', '$mdMedia',
        function ($scope, eventsService, dialogService, $state, $stateParams, $location, $mdMedia) {
            $scope.selectedIndex = parseInt($location.search().view) || 0;
            $scope.options = $scope.options || {};
            $scope.selected = $scope.selected || [];            
            $scope.edited = [];
            
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
                $scope.initGridData($scope.deliveryReport);
            });

            $scope.gridOptions = {
                enableFiltering: false,
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);
                    gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                        if (newValue !== oldValue) {
                            if ($scope.edited.indexOf(rowEntity.id) < 0) {
                                $scope.edited.push(rowEntity.id);
                            }
                        }
                    });
                },
                rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ng-keydown="grid.appScope.gridCellTab($event, col)"><dl><dt hide-gt-sm ng-hide="col.cellClass === \'actions-col\'">{{col.name}}</dt><dd ui-grid-cell class="ui-grid-cell"></dd></dl></div>',
                columnDefs: [
                    {field: 'status', name: 'Status', cellTemplate: '<div class="ui-grid-cell-contents status-{{row.entity.deliveryStatus}}" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'},
                    {field: 'name', name: 'Name'},
                    {field: 'email', name: 'Email', enableCellEditOnFocus: true, cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.isEdited(row.entity.id)" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'},
                    {field: 'id', name: 'Select', cellClass: 'actions-col', cellTemplate: '<div class="actions"><md-checkbox ng-checked="grid.appScope.isGuestSelected(row.entity)" ng-click="grid.appScope.toggleGuestSelected(row.entity)" aria-label="Select"></md-checkbox></div>', maxWidth: 100}
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
                    ['name', 'status', 'email'].forEach(function(field) {
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
            
            $scope.isEdited = function(id) {
                return $scope.edited.indexOf(id) > -1 ? 'edited' : '';
            };
            
            $scope.isGuestSelected = function(item) {
                return $scope.selected.indexOf(item) > -1;
            };
            $scope.toggleGuestSelected = function(item) {
                var idx = $scope.selected.indexOf(item);
                if (idx > -1) {
                    $scope.selected.splice(idx, 1);
                } else {
                    $scope.selected.push(item);
                }
            };            
            
            $scope.resend = function() {
                if ($scope.selected.length > 0) {
                    $scope.sendingData = true;
                    var data = {
                        EventId: $scope.event.id,
                        EmailRequests: []
                    };
                    angular.forEach($scope.selected, function(item){
                        data.EmailRequests.push({
                            GuestId: item.id, 
                            MessageType: item.messageType
                        });
                    });
                    eventsService.resendGuestEmails(data).then(function() {
                        $scope.edited = [];
                        angular.forEach($scope.selected, function(item){
                            var index = $scope.gridOptions.data.indexOf(item);
                            if (index > -1) {
                                $scope.gridOptions.data[index].status = $scope.getTextStatus(3);
                                $scope.gridOptions.data[index].deliveryStatus = 3;
                            }
                        });
                        $scope.selected = [];
                    }, function() {
                        dialogService.error('There was a problem resending guest emails, please try again');
                    }).finally(function() {
                        $scope.sendingData = false;
                    });
                }
            };
            
            $scope.initGridData = function(data) {
                $scope.gridOptions.data = [];
                if (!data) {
                    return;
                }
                angular.forEach(data, function(guest) {
                    $scope.gridOptions.data.push({
                        id: guest.GuestId,
                        name: guest.FirstName +' '+ guest.LastName,
                        email: guest.Email,
                        status: $scope.getTextStatus(guest.DeliveryStatus),
                        messageType: guest.MessageType,
                        deliveryStatus: guest.DeliveryStatus
                    });
                });
            };
            // EmailMessageType Confirmation = 1 Rsvp = 2 Ticketing = 3
            
            $scope.getTextStatus = function(status) {
                if (status === 0) {
                    return 'Sending';
                } else if (status === 1) {
                    return 'Delivered';
                } else if (status === 2) {
                    return 'DeliveryFailed';
                } else if (status === 3) {
                    return 'Successful';
                }
                return '';
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
                
                $scope.fetchingData = true;
                eventsService.getEmailDeliveryReport(eventId).then(function(data) {
                    $scope.deliveryReport = data.DeliveryReports;
                    $scope.initGridData($scope.deliveryReport);
                }, function() {
                    dialogService.error('There was a problem getting delivery report, please try again');
                }).finally(function() {
                    $scope.fetchingData = false;
                });
            };
        }
    ]);