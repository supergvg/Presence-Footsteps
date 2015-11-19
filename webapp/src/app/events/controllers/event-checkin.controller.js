'use strict';

angular.module('gliist')
    .controller('EventCheckinCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$timeout', 'userService',
        function ($scope, $stateParams, dialogService, $state, eventsService, $timeout, userService) {
            
            $scope.getExportExcelUrl = function() {
                return window.redirectUrl+'api/Event/GuestsListsExcelFile/'+$scope.event.id+'?authToken='+window.localStorage['access_token'];
            };
            
            $scope.checkinGuest = function (checkin) {
                $state.go('main.check_guest', {
                    guestId: checkin.guest.id,
                    gliId: checkin.gl_id
                });
            };

            $scope.getEventInvite = function (height) {
                return {
                    'background-image': "url(" + $scope.event.invitePicture + ")",
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-size': 'cover'
                };
            };

            $scope.glOptions = {
                readOnly: true
            };

            $scope.getRowStyle = function (checkin) {
                if (!$scope.guestPending(checkin)) {
                    return {
                        'background-color': '#CCCCCC',
                        'color': 'white',
                        'padding-top': '10px',
                        'height': '50px'
                    }
                } else {
                    return {
                        'border-bottom': 'thin inset #ECECEC',
                        'background-color': 'white',
                        'padding-top': '10px',
                        'height': '50px'
                    }
                }

            };

            $scope.gridOptions = {
                rowTemplate: '<div' +
                    '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                    'ng-style="grid.appScope.getRowStyle(row.entity)" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ' +
                    ' ui-grid-cell></div>' +
                    '</div>',
                columnDefs: [
                    {field: 'guest.firstName', name: 'First Name', enableHiding: false},
                    {field: 'guest.lastName', name: 'Last Name', enableHiding: false},
                    {field: 'guest.title', name: 'List Title', enableHiding: false},
                    {field: 'guest.type', name: 'Type', enableSorting: true, enableHiding: false, width: 80},
                    {field: 'guest.email', name: 'Email', enableSorting: false, enableHiding: false},
                    {field: 'guest.plus', name: 'Plus', enableSorting: false, enableHiding: false, width: 60},
                    {
                        name: 'Check in', field: 'guest.id', enableSorting: false, enableHiding: false, width: 80,
                        cellTemplate: '<div class="ui-grid-cell-contents" style="padding: 0;float: right" title="Checkin">' +
                            '<md-button md-no-ink="\'true\'" class="md-primary" ng-click="grid.appScope.checkinGuest(row.entity)" style="border-radius: 0px!important;position:absolute;right:0;margin-top:-10px">' +
                            '<md-icon ng-show="row.entity.status == \'checked in\'" style="margin-right: 5px;margin-top: 5px" md-svg-src="assets/images/SVG/checkGreen.svg"></md-icon>' +
                            '<md-icon class="logo-bg" ng-show="grid.appScope.guestPending(row.entity)" style="height: 53px;width: 50px;margin-top: -2px;margin-right: -6px;" md-svg-src="assets/images/SVG/edit01.svg"></md-icon>' +
                            '</md-button>' +
                            '</div>'
                    }

                ],
                rowHeight: 35,
                data: []
            };

            $scope.$watchCollection('guestFilter', function (newValue) {

                    if (!newValue) {
                        return;
                    }

                    $scope.initGridData(newValue, $scope.event);
                }
            );


            $scope.guestPending = function (checkin) {
                return (checkin.status === 'no show');
            };

            $scope.initGridData = function (filter, data) {
                if (!data) {
                    return;
                }

                $scope.gridOptions.data = [];

                angular.forEach(data.guestLists, function (gl) {
                    angular.forEach(gl.actual, function (checkin) {

                            if (!checkin.guest.type) {
                                checkin.guest.type = gl.listType;
                            }
                            if (!checkin.guest.title) {
                                checkin.guest.title = gl.title;
                            }

                            var passedNameFilter = true;
                            if (filter.name) {
                                if (checkin.guest.firstName.toLowerCase().indexOf(filter.name.toLowerCase()) === -1 &&
                                    checkin.guest.lastName.toLowerCase().indexOf(filter.name.toLowerCase()) === -1) {
                                    passedNameFilter = false;
                                }
                            }
                            if (passedNameFilter) {
                                var guestPending = $scope.guestPending(checkin);

                                if (filter.status === 'checked' && !guestPending) {
                                    $scope.gridOptions.data.push(checkin);
                                }

                                if (filter.status === 'pending' && guestPending) {
                                    $scope.gridOptions.data.push(checkin);

                                }
                            }
                        }
                    );
                });
            };


            $scope.pastEvent = function () {
                var now = Date.now(),
                    d_now = new Date(now),
                    end_time = new Date($scope.event.endTime);

                if ($scope.event.utcOffset) {
                    now = now - (d_now.getTimezoneOffset() * 60000) - ($scope.event.utcOffset * 1000);
                    d_now = new Date(now);
                }

                if (end_time < d_now) {
                    return true;
                }

                return false;
            };

            $scope.event = {id: 0};

            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.guestFilter = {status: 'pending'};

                $scope.initializing = true;

                $timeout(function () {
                    $(window).resize();
                }, 1000);

                eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;


                    if ($scope.pastEvent()) {
                        $scope.gridOptions.columnDefs.pop();
                    }


                    $scope.initGridData($scope.guestFilter, data);

                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.initializing = false;
                    }
                )

            };

            $scope.init();

        }
    ]);
