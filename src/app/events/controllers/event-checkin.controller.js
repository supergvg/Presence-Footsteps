'use strict';

angular.module('gliist')
    .controller('EventCheckinCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$filter', '$window',
        function ($scope, $stateParams, dialogService, $state, eventsService, $filter, $window) {
            $scope.event = {id: 0};
            $scope.options = {
                filter: {
                    active: true,
                    placeholder: 'Search Guest',
                    fields: ['firstName', 'lastName']
                },
                sorting: {
                    active: true
                },
                display: {
                    totalViewportItems: 7
                },
                gridOptions: {
                    columnDefs: [
                        {field: 'firstName', name: 'First Name', allowCellFocus: false},
                        {field: 'lastName', name: 'Last Name', allowCellFocus: false},
                        {field: 'title', name: 'List Title', allowCellFocus: false},
                        {field: 'type', name: 'Type', width: 80, allowCellFocus: false},
                        {field: 'email', name: 'Email', allowCellFocus: false},
                        {field: 'plus', name: 'Plus', width: 80, allowCellFocus: false},
                        {
                            name: 'Check in', field: 'id', enableSorting: false, width: 90, allowCellFocus: false,
                            cellTemplate: '<div class="actions" title="Checkin">' +
                                '<md-button class="icon-btn" md-no-ink="\'true\'" ng-click="grid.appScope.options.methods.checkinGuest(row.entity)" aria-label="CheckIn">' +
                                '<md-icon ng-show="row.entity.status == \'checked in\'" md-svg-src="assets/images/SVG/checkWhite.svg"></md-icon>' +
                                '<md-icon ng-show="grid.appScope.options.methods.guestPending(row.entity)" md-svg-src="assets/images/SVG/checklist.svg"></md-icon>' +
                                '</md-button>' +
                                '</div>'
                        }
                    ]
                }
            };
            $scope.options.methods = {
                updateGridData: function() {
                    var data = $scope.event;
                    $scope.options.gridOptions.data = [];
                    if (!data) {
                        return;
                    }
                    angular.forEach($scope.event.guestLists, function(gl) {
                        angular.forEach(gl.actual, function(checkin) {
                            if (!checkin.guest.type) {
                                checkin.guest.type = gl.listType;
                            }
                            if (!checkin.guest.title) {
                                checkin.guest.title = gl.title;
                            }
                            $scope.options.gridOptions.data.push({
                                firstName: checkin.guest.firstName,
                                lastName: checkin.guest.lastName,
                                title: checkin.guest.title,
                                type: checkin.guest.type,
                                email: checkin.guest.email,
                                plus: checkin.guest.plus,
                                id: checkin.guest.id,
                                status: checkin.status,
                                gliId: checkin.gl_id
                            });
                        });
                    });
                },
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    gridApi.grid.registerRowsProcessor($scope.customFilter, 150);
                },
                guestPending: function(row){
                    return (row.status === 'no show');
                },
                checkinGuest: function(row) {
                    $state.go('main.check_guest', {
                        guestId: row.id,
                        gliId: row.gliId
                    });
                }
            };
            
            $scope.getExportExcelUrl = function() {
                return $window.redirectUrl+'api/Event/GuestsListsExcelFile/'+$scope.event.id+'?authToken='+$window.localStorage.access_token;
            };
            
            $scope.filter = {
                status: 'pending'
            };

            $scope.customFilter = function(renderableRows) {
                renderableRows.forEach(function(row) {
                    row.visible = false;
                    if ($scope.filter.status === 'checked' && !$scope.options.methods.guestPending(row.entity)) {
                        row.visible = true;
                    }
                    if ($scope.filter.status === 'pending' && $scope.options.methods.guestPending(row.entity)) {
                        row.visible = true;
                    }
                });
                return renderableRows;
            };
            
            $scope.$watchCollection('filter', function(newValue) {
                if (!newValue) {
                    return;
                }
                if ($scope.gridApi) {
                    $scope.gridApi.grid.refresh();
                }
            });

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
                        $scope.options.gridOptions.columnDefs.pop();
                    }
                    $scope.options.methods.updateGridData();
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
