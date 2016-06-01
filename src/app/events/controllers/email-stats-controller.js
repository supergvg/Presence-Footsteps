'use strict';

angular.module('gliist')
    .controller('EmailStatsController', ['$scope', 'eventsService', 'dialogService', '$state', '$stateParams', '$location',
        function ($scope, eventsService, dialogService, $state, $stateParams, $location) {
            $scope.selectedIndex = parseInt($location.search().view) || 0;
            $scope.selected = [];
            $scope.edited = [];
            $scope.options = $scope.options || {};
            $scope.options = {
                filter: {
                    active: true,
                    placeholder: 'Search Guest',
                    fields: ['name', 'status', 'email']
                },
                sorting: {
                    active: true
                },
                display: {
                    totalMobileViewportItems: 2,
                    totalViewportItems: 6
                },
                gridOptions: {
                    columnDefs: [
                        {field: 'status', name: 'Status', cellTemplate: '<div class="ui-grid-cell-contents status-{{row.entity.deliveryStatus}}" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'},
                        {field: 'name', name: 'Name'},
                        {field: 'email', name: 'Email', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="grid.appScope.options.methods.isEdited(row.entity.id)" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'},
                        {
                            field: 'id', name: 'Select', enableSorting: false, allowCellFocus: false, maxWidth: 80, cellClass: 'actions-col',
                            cellTemplate: '<div class="actions"><md-checkbox ng-checked="grid.appScope.options.methods.isGuestSelected(row.entity)" ng-click="grid.appScope.options.methods.toggleGuestSelected(row.entity)" aria-label="Select"></md-checkbox></div>'
                        }
                    ]
                },
                gridData: []
            };
            
            $scope.options.methods = {
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                        if (newValue !== oldValue) {
                            rowEntity.deliveryStatus = 2;
                            rowEntity.status = $scope.getTextStatus(rowEntity.deliveryStatus);
                            if ($scope.edited.indexOf(rowEntity.id) < 0) {
                                $scope.edited.push(rowEntity.id);
                            }
                        }
                    });
                },
                isGuestSelected: function(item) {
                    return $scope.selected.indexOf(item) > -1;
                },
                toggleGuestSelected: function(item) {
                    var idx = $scope.selected.indexOf(item);
                    if (idx > -1) {
                        $scope.selected.splice(idx, 1);
                    } else {
                        $scope.selected.push(item);
                    }
                },
                isEdited: function(id) {
                    return $scope.edited.indexOf(id) > -1 ? 'edited' : '';
                }
            };
            
            $scope.getSelected = function(idx) {
                return ($scope.selectedIndex === idx ? 'active' : '');
            };
            
            $scope.$watch('selectedIndex', function(newValue) {
                $location.search('view', newValue);
            });
            
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
                            var index = $scope.options.gridData.indexOf(item);
                            if (index > -1) {
                                $scope.options.gridData[index].status = $scope.getTextStatus(0);
                                $scope.options.gridData[index].deliveryStatus = 0;
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
            
            $scope.getTextStatus = function(status) {
                if (status === 0) {
                    return 'Sending';
                } else if (status === 1) {
                    return 'Successful';
                } else if (status === 2) {
                    return 'Not Delivered';
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
                    angular.forEach($scope.deliveryReport, function(guest) {
                        $scope.options.gridData.push({
                            id: guest.GuestId,
                            name: guest.FirstName +' '+ guest.LastName,
                            email: guest.Email,
                            status: $scope.getTextStatus(guest.DeliveryStatus),
                            messageType: guest.MessageType,
                            deliveryStatus: guest.DeliveryStatus
                        });
                    });
                }, function() {
                    dialogService.error('There was a problem getting delivery report, please try again');
                }).finally(function() {
                    $scope.fetchingData = false;
                });
            };
        }
    ]);